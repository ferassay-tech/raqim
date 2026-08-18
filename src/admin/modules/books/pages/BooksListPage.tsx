import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useBooks } from "@/admin/context/BooksContext";
import { useCategories } from "@/admin/context/CategoriesContext";
import type { AdminBook, BookStatus } from "@/admin/types/book";
import { BOOK_STATUS_META, CURRENCY_SYMBOLS } from "@/admin/types/book";
import { BOOK_PLACEMENT_META } from "@/admin/lib/bookPlacement";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import { SearchInput } from "@/admin/components/ui/SearchInput";
import { FilterBar, FilterSelect } from "@/admin/components/ui/FilterBar";
import { DataTable } from "@/admin/components/ui/DataTable";
import type { DataTableColumn } from "@/admin/components/ui/DataTable";
import { Pagination } from "@/admin/components/ui/Pagination";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { BulkActionBar } from "@/admin/components/ui/BulkActionBar";
import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { BookCoverThumb } from "../components/BookCoverThumb";
import { BookRowActions } from "../components/BookRowActions";
import { BookPreviewDrawer } from "../components/BookPreviewDrawer";
import { IconArchive, IconBook, IconCheck, IconPlus, IconRefresh, IconTrash } from "@/admin/icons";
import { useHasPermission } from "@/admin/lib/useHasPermission";
import type { BulkAction } from "@/admin/components/ui/BulkActionBar";
import { LoadErrorBanner } from "@/admin/components/ui/LoadErrorBanner";

const STATUS_VARIANT = {
  published: "success",
  draft: "warning",
  archived: "neutral",
} as const;

const PAGE_SIZE = 8;

type SortKey = "title" | "category" | "price" | "stock" | "sales" | "status";

function primaryPrice(book: AdminBook) {
  return book.prices.USD ?? book.prices.EGP ?? book.prices.ILS ?? null;
}

const SORT_ACCESSORS: Record<SortKey, (b: AdminBook) => string | number> = {
  title: (b) => b.title,
  category: (b) => b.category,
  price: (b) => primaryPrice(b)?.price ?? 0,
  stock: (b) => b.stock,
  sales: (b) => b.sales,
  status: (b) => b.status,
};

export default function BooksListPage() {
  const {
    books,
    deleteBooks,
    deleteBook,
    duplicateBook,
    setBooksStatus,
    restoreBook,
    restoreBooks,
    permanentlyDeleteBook,
    loadError,
    reload,
  } = useBooks();
  const { categories, getCategoryMatchName } = useCategories();
  const navigate = useNavigate();
  const location = useLocation();

  const hasPermission = useHasPermission();
  const canCreate = hasPermission("books.create");
  // books.edit backs every plain update: edit, archive/unarchive, and moving
  // a book to/from the trash (deletedAt is a column update, not a DELETE).
  const canEdit = hasPermission("books.edit");
  // books.delete only backs the hard, irreversible delete from the trash view.
  const canDelete = hasPermission("books.delete");

  const [flash, setFlash] = useState<string | null>((location.state as { flash?: string } | null)?.flash ?? null);
  const [showTrash, setShowTrash] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminBook | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [permanentTarget, setPermanentTarget] = useState<AdminBook | null>(null);

  useEffect(() => {
    if (!flash) return;
    navigate(location.pathname, { replace: true, state: {} });
    const t = setTimeout(() => setFlash(null), 3500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trashCount = useMemo(() => books.filter((b) => b.deletedAt !== null).length, [books]);
  const activeBooks = useMemo(() => books.filter((b) => b.deletedAt === null), [books]);
  const trashedBooks = useMemo(() => books.filter((b) => b.deletedAt !== null), [books]);
  const scopedBooks = showTrash ? trashedBooks : activeBooks;

  const filtered = useMemo(() => {
    return scopedBooks.filter((b) => {
      const matchesSearch =
        !search.trim() ||
        b.title.includes(search) ||
        b.author.includes(search) ||
        b.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || b.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [scopedBooks, search, categoryFilter, statusFilter]);

  const sorted = useMemo(() => {
    const accessor = SORT_ACCESSORS[sortKey];
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), "ar");
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount);
  const pageRows = sorted.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter, showTrash]);

  const previewBook = previewId ? books.find((b) => b.id === previewId) ?? null : null;

  const handleSortChange = (key: string) => {
    if (key === sortKey) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key as SortKey);
      setSortDirection("asc");
    }
  };

  const columns: DataTableColumn<AdminBook>[] = [
    {
      key: "title",
      header: "الكتاب",
      sortAccessor: SORT_ACCESSORS.title,
      className: "min-w-[240px]",
      render: (b) => (
        <div className="flex items-center gap-3">
          <BookCoverThumb id={b.id} cover={b.cover} title={b.title} className="h-14 w-10 shrink-0" />
          <div className="min-w-0">
            <p className="truncate font-display text-[15px] text-ink">{b.title}</p>
            <p className="truncate text-xs text-ink-faint">{b.author}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "التصنيف",
      sortAccessor: SORT_ACCESSORS.category,
      render: (b) => <span className="text-ink-soft">{b.category}</span>,
    },
    {
      key: "placement",
      header: "الظهور",
      render: (b) => {
        const meta = BOOK_PLACEMENT_META[b.placement];
        return <StatusBadge variant={meta.variant}>{meta.label}</StatusBadge>;
      },
    },
    {
      key: "price",
      header: "السعر",
      sortAccessor: SORT_ACCESSORS.price,
      align: "end",
      render: (b) => {
        const p = primaryPrice(b);
        if (!p) return <span className="text-ink-faint">—</span>;
        return (
          <div className="flex items-center justify-end gap-2">
            {p.compareAtPrice && (
              <span className="text-xs text-ink-faint line-through">
                {CURRENCY_SYMBOLS.USD}
                {p.compareAtPrice.toFixed(2)}
              </span>
            )}
            <span className="text-ink">
              {CURRENCY_SYMBOLS.USD}
              {p.price.toFixed(2)}
            </span>
          </div>
        );
      },
    },
    {
      key: "stock",
      header: "المخزون",
      sortAccessor: SORT_ACCESSORS.stock,
      align: "end",
      render: (b) => <span className="text-ink-soft">{b.stock.toLocaleString("en-US")}</span>,
    },
    {
      key: "sales",
      header: "المبيعات",
      sortAccessor: SORT_ACCESSORS.sales,
      align: "end",
      render: (b) => <span className="text-ink-soft">{b.sales.toLocaleString("en-US")}</span>,
    },
    {
      key: "status",
      header: "الحالة",
      sortAccessor: SORT_ACCESSORS.status,
      render: (b) => <StatusBadge variant={STATUS_VARIANT[b.status]}>{BOOK_STATUS_META[b.status]}</StatusBadge>,
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (b) =>
        showTrash ? (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {canEdit && (
              <button
                type="button"
                onClick={() => restoreBook(b.id)}
                aria-label="استعادة"
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-cream hover:text-ink"
              >
                <IconRefresh className="h-4 w-4" />
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => setPermanentTarget(b)}
                aria-label="حذف نهائي"
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <IconTrash className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <BookRowActions
            archived={b.status === "archived"}
            onPreview={() => setPreviewId(b.id)}
            onEdit={() => navigate(`/admin/books/edit/${b.id}`)}
            onDuplicate={() => duplicateBook(b.id)}
            onArchive={() => setBooksStatus([b.id], b.status === "archived" ? "draft" : "archived")}
            onDelete={() => setDeleteTarget(b)}
            canEdit={canEdit}
            canDuplicate={canCreate}
            canDelete={canEdit}
          />
        ),
    },
  ];

  const isEmptyCatalog = scopedBooks.length === 0;
  const isEmptyResults = !isEmptyCatalog && sorted.length === 0;

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader
        title="الكتب"
        description={`إدارة كتالوج رقيم — ${activeBooks.length.toLocaleString("en-US")} كتابًا`}
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowTrash((v) => !v)}
              className={`rounded-full border px-4 py-2.5 text-sm transition-colors ${
                showTrash ? "border-ink bg-ink text-ivory" : "border-beige text-ink-soft hover:border-gold hover:text-ink"
              }`}
            >
              المحذوفة ({trashCount})
            </button>
            {!showTrash && canCreate && (
              <Link
                to="/admin/books/new"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-deep"
              >
                <IconPlus className="h-4 w-4" />
                إضافة كتاب
              </Link>
            )}
          </div>
        }
      />

      {loadError && <LoadErrorBanner message={loadError} onRetry={reload} />}

      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2.5 rounded-[10px] border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
          >
            <IconCheck className="h-4 w-4 shrink-0" />
            {flash}
          </motion.div>
        )}
      </AnimatePresence>

      {!isEmptyCatalog && (
        <FilterBar>
          <SearchInput value={search} onChange={setSearch} placeholder="ابحثي بالعنوان، المؤلفة، أو SKU" className="w-full sm:w-64" />
          <FilterSelect
            ariaLabel="التصنيف"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: "all", label: "جميع التصنيفات" },
              ...categories.map((c) => ({ value: getCategoryMatchName(c.id), label: c.name })),
            ]}
          />
          <FilterSelect
            ariaLabel="الحالة"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "كل الحالات" },
              ...(Object.entries(BOOK_STATUS_META) as [BookStatus, string][]).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
        </FilterBar>
      )}

      {!showTrash && (
        <BulkActionBar
          count={selectedKeys.size}
          onClear={() => setSelectedKeys(new Set())}
          actions={
            // publish/archive/soft-delete are all plain updates -> books.edit
            canEdit
              ? ([
                  {
                    key: "publish",
                    label: "نشر",
                    icon: IconCheck,
                    onClick: () => setBooksStatus([...selectedKeys], "published"),
                  },
                  {
                    key: "archive",
                    label: "أرشفة",
                    icon: IconArchive,
                    onClick: () => setBooksStatus([...selectedKeys], "archived"),
                  },
                  {
                    key: "delete",
                    label: "حذف",
                    icon: IconTrash,
                    tone: "danger",
                    onClick: () => setBulkDeleteOpen(true),
                  },
                ] satisfies BulkAction[])
              : []
          }
        />
      )}

      {showTrash && selectedKeys.size > 0 && (
        <BulkActionBar
          count={selectedKeys.size}
          onClear={() => setSelectedKeys(new Set())}
          actions={
            canEdit
              ? ([
                  {
                    key: "restore",
                    label: "استعادة",
                    icon: IconRefresh,
                    onClick: () => {
                      restoreBooks([...selectedKeys]);
                      setSelectedKeys(new Set());
                    },
                  },
                ] satisfies BulkAction[])
              : []
          }
        />
      )}

      {isEmptyCatalog ? (
        <EmptyState
          icon={IconBook}
          title={showTrash ? "لا توجد كتب محذوفة" : "لا توجد كتب بعد"}
          description={showTrash ? "الكتب المحذوفة ستظهر هنا." : "ابدئي ببناء كتالوج رقيم بإضافة أول كتاب."}
          action={
            !showTrash && canCreate && (
              <Link
                to="/admin/books/new"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-deep"
              >
                <IconPlus className="h-4 w-4" />
                إضافة كتاب جديد
              </Link>
            )
          }
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={pageRows}
            rowKey={(b) => b.id}
            selectable
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            onRowClick={(b) => setPreviewId(b.id)}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            emptyState={
              isEmptyResults ? (
                <EmptyState
                  icon={IconBook}
                  title="لا توجد نتائج"
                  description="جربي تعديل كلمات البحث أو الفلاتر المستخدمة."
                />
              ) : undefined
            }
          />
          <Pagination
            page={clampedPage}
            pageCount={pageCount}
            totalItems={sorted.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}

      <BookPreviewDrawer book={previewBook} onClose={() => setPreviewId(null)} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف الكتاب"
        description={`هل تريدين نقل «${deleteTarget?.title ?? ""}» إلى المحذوفات؟ يمكنك استعادته لاحقًا.`}
        confirmLabel="نقل إلى المحذوفات"
        onConfirm={() => {
          if (deleteTarget) deleteBook(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title="حذف الكتب المحددة"
        description={`هل تريدين نقل ${selectedKeys.size} كتابًا إلى المحذوفات؟ يمكنك استعادتها لاحقًا.`}
        confirmLabel="نقل إلى المحذوفات"
        onConfirm={() => {
          deleteBooks([...selectedKeys]);
          setSelectedKeys(new Set());
          setBulkDeleteOpen(false);
        }}
        onCancel={() => setBulkDeleteOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(permanentTarget)}
        title="حذف نهائي"
        description={`هل تريدين حذف «${permanentTarget?.title ?? ""}» نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف نهائي"
        onConfirm={() => {
          if (permanentTarget) permanentlyDeleteBook(permanentTarget.id);
          setPermanentTarget(null);
        }}
        onCancel={() => setPermanentTarget(null)}
      />
    </div>
  );
}

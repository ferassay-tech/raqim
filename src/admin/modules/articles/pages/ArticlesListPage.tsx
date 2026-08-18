import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useArticles } from "@/admin/context/ArticlesContext";
import type { AdminArticle } from "@/admin/types/article";
import { ARTICLE_STATUS_META, ARTICLE_STATUS_OPTIONS, estimateReadingMinutes } from "@/admin/lib/articleStatus";
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
import { ArticlePreviewDrawer } from "../components/ArticlePreviewDrawer";
import { IconCheck, IconCopy, IconDocument, IconEye, IconPlus, IconTrash } from "@/admin/icons";
import { useHasPermission } from "@/admin/lib/useHasPermission";
import type { BulkAction } from "@/admin/components/ui/BulkActionBar";
import { LoadErrorBanner } from "@/admin/components/ui/LoadErrorBanner";

const PAGE_SIZE = 8;

type SortKey = "title" | "author" | "status" | "updatedAt";

const SORT_ACCESSORS: Record<SortKey, (a: AdminArticle) => string | number> = {
  title: (a) => a.title,
  author: (a) => a.author,
  status: (a) => a.status,
  updatedAt: (a) => a.updatedAt,
};

export default function ArticlesListPage() {
  const { articles, deleteArticle, deleteArticles, duplicateArticle, setArticlesStatus, loadError, reload } =
    useArticles();
  const navigate = useNavigate();
  const location = useLocation();

  const hasPermission = useHasPermission();
  // duplicateArticle inserts a new row -> articles.create.
  const canCreate = hasPermission("articles.create");
  // setArticlesStatus (bulk publish/draft) is a plain update -> articles.edit.
  const canEdit = hasPermission("articles.edit");
  // deleteArticle/deleteArticles are hard deletes -> articles.delete.
  const canDelete = hasPermission("articles.delete");

  const [flash, setFlash] = useState<string | null>((location.state as { flash?: string } | null)?.flash ?? null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminArticle | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  useEffect(() => {
    if (!flash) return;
    navigate(location.pathname, { replace: true, state: {} });
    const t = setTimeout(() => setFlash(null), 3500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchesSearch =
        !search.trim() ||
        a.title.includes(search) ||
        a.excerpt.includes(search) ||
        a.author.includes(search);
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [articles, search, statusFilter]);

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
  }, [search, statusFilter]);

  const previewArticle = previewId ? articles.find((a) => a.id === previewId) ?? null : null;

  const handleSortChange = (key: string) => {
    if (key === sortKey) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key as SortKey);
      setSortDirection("asc");
    }
  };

  const dateLabel = (a: AdminArticle) => {
    if (a.status === "scheduled" && a.scheduledFor) return `مجدولة: ${a.scheduledFor}`;
    if (a.status === "published" && a.publishedAt) return `نُشرت: ${a.publishedAt}`;
    return `آخر تعديل: ${a.updatedAt}`;
  };

  const columns: DataTableColumn<AdminArticle>[] = [
    {
      key: "title",
      header: "المقالة",
      sortAccessor: SORT_ACCESSORS.title,
      className: "min-w-[280px]",
      render: (a) => (
        <div className="min-w-0">
          <p className="truncate font-display text-[15px] text-ink">{a.title}</p>
          <p className="mt-0.5 truncate text-xs text-ink-faint">{a.excerpt || "بلا ملخص"}</p>
        </div>
      ),
    },
    {
      key: "author",
      header: "الكاتبة",
      sortAccessor: SORT_ACCESSORS.author,
      render: (a) => <span className="text-ink-soft">{a.author}</span>,
    },
    {
      key: "reading",
      header: "القراءة",
      render: (a) => <span className="text-ink-soft">{estimateReadingMinutes(a.content)} د</span>,
    },
    {
      key: "date",
      header: "التاريخ",
      className: "min-w-[160px]",
      render: (a) => <span className="text-ink-soft">{dateLabel(a)}</span>,
    },
    {
      key: "status",
      header: "الحالة",
      sortAccessor: SORT_ACCESSORS.status,
      render: (a) => {
        const meta = ARTICLE_STATUS_META[a.status];
        return <StatusBadge variant={meta.variant}>{meta.label}</StatusBadge>;
      },
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (a) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setPreviewId(a.id)}
            aria-label="معاينة المقالة"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-cream hover:text-ink"
          >
            <IconEye className="h-4 w-4" />
          </button>
          {canCreate && (
            <button
              type="button"
              onClick={() => duplicateArticle(a.id)}
              aria-label="نسخ المقالة"
              className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-cream hover:text-ink"
            >
              <IconCopy className="h-4 w-4" />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => setDeleteTarget(a)}
              aria-label="حذف المقالة"
              className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <IconTrash className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const isEmptyCatalog = articles.length === 0;
  const isEmptyResults = !isEmptyCatalog && sorted.length === 0;

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader
        title="المقالات"
        description={`${articles.length.toLocaleString("en-US")} مقالة`}
        actions={
          canCreate && (
            <Link
              to="/admin/articles/new"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-deep"
            >
              <IconPlus className="h-4 w-4" />
              مقالة جديدة
            </Link>
          )
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
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="ابحثي بالعنوان أو الملخص أو الكاتبة"
            className="w-full sm:w-72"
          />
          <FilterSelect
            ariaLabel="الحالة"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[{ value: "all", label: "كل الحالات" }, ...ARTICLE_STATUS_OPTIONS]}
          />
        </FilterBar>
      )}

      <BulkActionBar
        count={selectedKeys.size}
        onClear={() => setSelectedKeys(new Set())}
        actions={
          [
            canEdit && {
              key: "publish",
              label: "نشر",
              icon: IconCheck,
              onClick: () => setArticlesStatus([...selectedKeys], "published"),
            },
            canEdit && {
              key: "draft",
              label: "تحويل لمسودة",
              onClick: () => setArticlesStatus([...selectedKeys], "draft"),
            },
            canDelete && {
              key: "delete",
              label: "حذف",
              icon: IconTrash,
              tone: "danger",
              onClick: () => setBulkDeleteOpen(true),
            },
          ].filter(Boolean) as BulkAction[]
        }
      />

      {isEmptyCatalog ? (
        <EmptyState
          icon={IconDocument}
          title="لا توجد مقالات بعد"
          description="ابدئي بكتابة أول مقالة لمدونة رقيم."
          action={
            canCreate && (
              <Link
                to="/admin/articles/new"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-deep"
              >
                <IconPlus className="h-4 w-4" />
                مقالة جديدة
              </Link>
            )
          }
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={pageRows}
            rowKey={(a) => a.id}
            selectable
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            onRowClick={(a) => navigate(`/admin/articles/edit/${a.id}`)}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            emptyState={
              isEmptyResults ? (
                <EmptyState icon={IconDocument} title="لا توجد نتائج" description="جربي تعديل كلمات البحث أو الفلتر المستخدم." />
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

      <ArticlePreviewDrawer article={previewArticle} onClose={() => setPreviewId(null)} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف المقالة"
        description={`هل تريدين حذف «${deleteTarget?.title ?? ""}»؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف نهائي"
        onConfirm={() => {
          if (deleteTarget) deleteArticle(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title="حذف المقالات المحددة"
        description={`هل تريدين حذف ${selectedKeys.size} مقالة؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف نهائي"
        onConfirm={() => {
          deleteArticles([...selectedKeys]);
          setSelectedKeys(new Set());
          setBulkDeleteOpen(false);
        }}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </div>
  );
}

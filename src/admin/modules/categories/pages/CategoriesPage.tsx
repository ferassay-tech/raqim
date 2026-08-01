import { useMemo, useState } from "react";
import { useCategories } from "@/admin/context/CategoriesContext";
import { useBooks } from "@/admin/context/BooksContext";
import type { AdminCategory, AdminCategoryRaw } from "@/admin/types/category";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import { DataTable } from "@/admin/components/ui/DataTable";
import type { DataTableColumn } from "@/admin/components/ui/DataTable";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { CategoryFormModal } from "../components/CategoryFormModal";
import { IconPencil, IconPlus, IconTag, IconTrash } from "@/admin/icons";

interface CategoryRow extends AdminCategory {
  bookCount: number;
}

export default function CategoriesPage() {
  const { categories, rawCategories, getCategoryMatchName, createCategory, updateCategory, deleteCategory } =
    useCategories();
  const { books } = useBooks();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategoryRaw | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);

  const rows: CategoryRow[] = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        bookCount: books.filter((b) => b.deletedAt === null && b.category === getCategoryMatchName(c.id)).length,
      })),
    [categories, books, getCategoryMatchName]
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category: AdminCategory) => {
    setEditing(rawCategories.find((c) => c.id === category.id) ?? null);
    setFormOpen(true);
  };

  const columns: DataTableColumn<CategoryRow>[] = [
    {
      key: "name",
      header: "التصنيف",
      className: "min-w-[200px]",
      render: (c) => <span className="text-ink">{c.name}</span>,
    },
    {
      key: "description",
      header: "الوصف",
      className: "min-w-[280px]",
      render: (c) => <span className="line-clamp-2 text-ink-soft">{c.description || "—"}</span>,
    },
    {
      key: "bookCount",
      header: "عدد الكتب",
      align: "end",
      render: (c) => <span className="text-ink-soft">{c.bookCount.toLocaleString("en-US")}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (c) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => openEdit(c)}
            aria-label="تعديل التصنيف"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-cream hover:text-ink"
          >
            <IconPencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={c.bookCount > 0}
            onClick={() => setDeleteTarget(c)}
            aria-label="حذف التصنيف"
            title={c.bookCount > 0 ? "لا يمكن حذف تصنيف يحتوي على كتب" : undefined}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-30"
          >
            <IconTrash className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader
        title="التصنيفات"
        description={`${categories.length.toLocaleString("en-US")} تصنيفًا`}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-deep"
          >
            <IconPlus className="h-4 w-4" />
            تصنيف جديد
          </button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={IconTag}
          title="لا توجد تصنيفات بعد"
          description="أضيفي تصنيفًا لتنظيم كتالوج الكتب."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-deep"
            >
              <IconPlus className="h-4 w-4" />
              تصنيف جديد
            </button>
          }
        />
      ) : (
        <DataTable columns={columns} rows={rows} rowKey={(c) => c.id} />
      )}

      <CategoryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialCategory={editing}
        existingCategories={rawCategories}
        onSave={(values) => {
          if (editing) updateCategory(editing.id, values);
          else createCategory(values);
          setFormOpen(false);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف التصنيف"
        description={`هل تريدين حذف تصنيف «${deleteTarget?.name ?? ""}»؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف نهائي"
        onConfirm={() => {
          if (deleteTarget) deleteCategory(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

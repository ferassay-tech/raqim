import { useMemo, useState } from "react";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import { DataTable } from "@/admin/components/ui/DataTable";
import type { DataTableColumn } from "@/admin/components/ui/DataTable";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { IconArchive, IconPencil, IconPlus, IconTrash } from "@/admin/icons";
import { useCommunicationCategories } from "@/admin/context/CommunicationCategoriesContext";
import { useCommunicationTemplates } from "@/admin/context/CommunicationTemplatesContext";
import { CommunicationCategoryFormModal } from "../components/CommunicationCategoryFormModal";
import { listChannels } from "../services/channelRegistry";
import type { CommunicationCategory } from "../types/category";

interface CategoryRow extends CommunicationCategory {
  templateCount: number;
}

export default function CommunicationCategoriesPage() {
  const { categories, createCategory, updateCategory, deleteCategory } = useCommunicationCategories();
  const { templates } = useCommunicationTemplates();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CommunicationCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);

  const channelLabel = useMemo(() => Object.fromEntries(listChannels().map((c) => [c.id, c.label])), []);

  const rows: CategoryRow[] = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        templateCount: templates.filter((t) => t.categoryId === c.id).length,
      })),
    [categories, templates]
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category: CommunicationCategory) => {
    setEditing(category);
    setFormOpen(true);
  };

  const columns: DataTableColumn<CategoryRow>[] = [
    {
      key: "label",
      header: "التصنيف",
      className: "min-w-[200px]",
      render: (c) => <span className="text-ink">{c.label}</span>,
    },
    {
      key: "description",
      header: "الوصف",
      className: "min-w-[260px]",
      render: (c) => <span className="line-clamp-2 text-ink-soft">{c.description || "—"}</span>,
    },
    {
      key: "channels",
      header: "القنوات",
      render: (c) => c.channelIds.map((id) => channelLabel[id]).join("، ") || "—",
    },
    {
      key: "templateCount",
      header: "عدد القوالب",
      align: "end",
      render: (c) => <span className="text-ink-soft">{c.templateCount.toLocaleString("en-US")}</span>,
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
            disabled={c.templateCount > 0}
            onClick={() => setDeleteTarget(c)}
            aria-label="حذف التصنيف"
            title={c.templateCount > 0 ? "لا يمكن حذف تصنيف يحتوي على قوالب" : undefined}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-30"
          >
            <IconTrash className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="تصنيفات القوالب"
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
          icon={IconArchive}
          title="لا توجد تصنيفات بعد"
          description="أضيفي تصنيفًا لتنظيم قوالب نظام التواصل."
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

      <CommunicationCategoryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialCategory={editing}
        existingLabels={categories.map((c) => c.label)}
        onSave={(values) => {
          if (editing) updateCategory(editing.id, values);
          else createCategory(values);
          setFormOpen(false);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف التصنيف"
        description={`هل تريدين حذف تصنيف «${deleteTarget?.label ?? ""}»؟ لا يمكن التراجع عن هذا الإجراء.`}
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

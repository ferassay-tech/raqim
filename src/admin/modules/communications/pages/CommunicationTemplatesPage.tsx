import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import { DataTable } from "@/admin/components/ui/DataTable";
import type { DataTableColumn } from "@/admin/components/ui/DataTable";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import type { StatusBadgeVariant } from "@/admin/components/ui/StatusBadge";
import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { Button } from "@/admin/components/ui/Button";
import { IconDocument, IconPlus } from "@/admin/icons";
import { formatArticleDate } from "@/admin/lib/articleStatus";
import { useCommunicationTemplates } from "@/admin/context/CommunicationTemplatesContext";
import { useCommunicationCategories } from "@/admin/context/CommunicationCategoriesContext";
import { listChannels } from "../services/channelRegistry";
import { CommunicationTemplateFormModal } from "../components/CommunicationTemplateFormModal";
import { CommunicationTemplateRowActions } from "../components/CommunicationTemplateRowActions";
import type { CommunicationTemplate, CommunicationTemplateStatus } from "../types/template";

const STATUS_META: Record<CommunicationTemplateStatus, { label: string; variant: StatusBadgeVariant }> = {
  draft: { label: "مسودة", variant: "neutral" },
  published: { label: "منشور", variant: "success" },
  archived: { label: "مؤرشف", variant: "warning" },
};

/** The real Template List (Template Management milestone) — replaces the
 * earlier "browse template types" preview that lived on this route during
 * the Communication System Foundation milestone. */
export default function CommunicationTemplatesPage() {
  const { templates, createTemplate, duplicateTemplate, archiveTemplate, deleteTemplate } =
    useCommunicationTemplates();
  const { categories } = useCommunicationCategories();
  const navigate = useNavigate();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CommunicationTemplate | null>(null);

  const categoryLabel = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.label])),
    [categories]
  );
  const channelLabel = useMemo(
    () => Object.fromEntries(listChannels().map((c) => [c.id, c.label])),
    []
  );

  const columns: DataTableColumn<CommunicationTemplate>[] = [
    {
      key: "name",
      header: "الاسم",
      className: "min-w-[220px]",
      render: (t) => <span className="font-medium text-ink">{t.name}</span>,
    },
    {
      key: "category",
      header: "التصنيف",
      render: (t) => <span className="text-ink-soft">{t.categoryId ? categoryLabel[t.categoryId] ?? "—" : "—"}</span>,
    },
    {
      key: "channel",
      header: "القناة",
      render: (t) => <span className="text-ink-soft">{channelLabel[t.channelId]}</span>,
    },
    {
      key: "status",
      header: "الحالة",
      render: (t) => <StatusBadge variant={STATUS_META[t.status].variant}>{STATUS_META[t.status].label}</StatusBadge>,
    },
    {
      key: "updatedAt",
      header: "آخر تحديث",
      render: (t) => <span dir="ltr" className="text-ink-faint">{formatArticleDate(t.updatedAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (t) => (
        <div onClick={(e) => e.stopPropagation()}>
          <CommunicationTemplateRowActions
            archived={t.status === "archived"}
            onEdit={() => navigate(`/admin/communications/templates/${t.id}`)}
            onDuplicate={() => duplicateTemplate(t.id)}
            onArchive={() => archiveTemplate(t.id)}
            onDelete={() => setDeleteTarget(t)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="القوالب"
        description={`${templates.length.toLocaleString("en-US")} قالبًا`}
        actions={
          <Button variant="primary" icon={IconPlus} onClick={() => setFormOpen(true)} className="!gap-2 !px-5 !font-normal">
            قالب جديد
          </Button>
        }
      />

      {templates.length === 0 ? (
        <EmptyState
          icon={IconDocument}
          title="لا توجد قوالب بعد"
          description="أنشئي أول قالب لبدء إدارة رسائل نظام التواصل."
          action={
            <Button
              variant="primary"
              icon={IconPlus}
              onClick={() => setFormOpen(true)}
              className="mt-2 !gap-2 !px-5 !font-normal"
            >
              قالب جديد
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={templates}
          rowKey={(t) => t.id}
          onRowClick={(t) => navigate(`/admin/communications/templates/${t.id}`)}
        />
      )}

      <CommunicationTemplateFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        categories={categories}
        onSave={(values) => {
          const created = createTemplate(values);
          setFormOpen(false);
          navigate(`/admin/communications/templates/${created.id}`);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف القالب"
        description={`هل تريدين حذف قالب «${deleteTarget?.name ?? ""}»؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف نهائي"
        onConfirm={() => {
          if (deleteTarget) deleteTemplate(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

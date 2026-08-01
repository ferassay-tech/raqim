import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { TextField } from "@/admin/components/forms/TextField";
import { TextArea } from "@/admin/components/forms/TextArea";
import { Select } from "@/admin/components/forms/Select";
import { IconArrowDown, IconArrowUp, IconDocument, IconEye, IconPencil, IconPlus, IconTrash } from "@/admin/icons";
import { useCommunicationTemplates } from "@/admin/context/CommunicationTemplatesContext";
import type { CommunicationTemplateFormValues } from "@/admin/context/CommunicationTemplatesContext";
import { useCommunicationCategories } from "@/admin/context/CommunicationCategoriesContext";
import type { Language } from "@/context/LanguageContext";
import { listChannels } from "../services/channelRegistry";
import { TemplateSectionFormModal } from "../components/TemplateSectionFormModal";
import { TemplatePreviewModal } from "../components/TemplatePreviewModal";
import type { TemplateSection, TemplateSectionRaw, TemplateSectionType } from "../types/section";

const STATUS_OPTIONS = [
  { value: "draft", label: "مسودة" },
  { value: "published", label: "منشور" },
  { value: "archived", label: "مؤرشف" },
];

const SECTION_TYPE_LABEL: Record<TemplateSectionType, string> = {
  header: "رأس",
  body: "محتوى",
  button: "زر",
  footer: "تذييل",
};

const EDITING_LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
];

/** One-line preview so a collapsed section card still says something
 * useful without opening it — reads whichever language is currently being
 * edited, falling back to Arabic. */
function previewFor(section: TemplateSectionRaw, language: Language): string {
  const resolve = (v: { ar: string; en: string }) => v[language] || v.ar || "";
  switch (section.type) {
    case "header":
      return resolve(section.fields.title) || "بدون عنوان";
    case "body":
      return resolve(section.fields.richText) || "بدون نص";
    case "button":
      return resolve(section.fields.label) || "بدون نص للزر";
    case "footer":
      return resolve(section.fields.text) || "بدون نص";
  }
}

function resolveSectionForPreview(section: TemplateSectionRaw, language: Language): TemplateSection {
  const resolve = (v: { ar: string; en: string }) => v[language] || v.ar || "";
  switch (section.type) {
    case "header":
      return {
        ...section,
        fields: { title: resolve(section.fields.title), subtitle: resolve(section.fields.subtitle) },
      };
    case "body":
      return { ...section, fields: { richText: resolve(section.fields.richText) } };
    case "button":
      return { ...section, fields: { label: resolve(section.fields.label), url: section.fields.url } };
    case "footer":
      return { ...section, fields: { text: resolve(section.fields.text) } };
  }
}

/**
 * Metadata form + a Content area managing the template's Sections
 * (add/edit/delete/reorder — no drag-and-drop, no visual builder) + a
 * Preview button rendering the current sections via renderTemplateToHtml().
 */
export default function CommunicationTemplateEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getRawTemplate,
    updateTemplate,
    addSection,
    updateSection,
    deleteSection,
    moveSectionUp,
    moveSectionDown,
  } = useCommunicationTemplates();
  const { categories } = useCommunicationCategories();
  const channels = listChannels();

  const template = id ? getRawTemplate(id) : undefined;
  const [values, setValues] = useState<CommunicationTemplateFormValues | null>(null);
  const [editingLanguage, setEditingLanguage] = useState<Language>("ar");
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<TemplateSectionRaw | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TemplateSectionRaw | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (template) {
      setValues({
        name: template.name,
        description: template.description,
        categoryId: template.categoryId,
        channelId: template.channelId,
        status: template.status,
      });
    }
  }, [template]);

  const sortedSections = useMemo(
    () => (template ? [...template.draft].sort((a, b) => a.order - b.order) : []),
    [template]
  );
  const previewSections = useMemo(
    () => sortedSections.map((s) => resolveSectionForPreview(s, editingLanguage)),
    [sortedSections, editingLanguage]
  );

  if (!template || !values) {
    return (
      <EmptyState
        icon={IconDocument}
        title="القالب غير موجود"
        description="ربما تم حذفه أو أن الرابط غير صحيح."
        action={
          <Link
            to="/admin/communications/templates"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-deep"
          >
            العودة إلى القوالب
          </Link>
        }
      />
    );
  }

  const save = () => {
    updateTemplate(template.id, values);
    navigate("/admin/communications/templates");
  };

  const openAddSection = () => {
    setEditingSection(null);
    setSectionModalOpen(true);
  };

  const openEditSection = (section: TemplateSectionRaw) => {
    setEditingSection(section);
    setSectionModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="تعديل القالب" description={template.name} />

      <div className="flex flex-col gap-4 rounded-[10px] border border-beige bg-white/70 p-6">
        <TextField
          label="اسم القالب"
          value={values.name}
          onChange={(v) => setValues((p) => (p ? { ...p, name: v } : p))}
          required
        />
        <TextArea
          label="الوصف"
          rows={3}
          value={values.description}
          onChange={(v) => setValues((p) => (p ? { ...p, description: v } : p))}
        />
        <Select
          label="التصنيف"
          value={values.categoryId ?? ""}
          onChange={(v) => setValues((p) => (p ? { ...p, categoryId: v || null } : p))}
          options={[{ value: "", label: "بدون تصنيف" }, ...categories.map((c) => ({ value: c.id, label: c.label }))]}
        />
        <Select
          label="القناة"
          value={values.channelId}
          onChange={(v) =>
            setValues((p) => (p ? { ...p, channelId: v as CommunicationTemplateFormValues["channelId"] } : p))
          }
          options={channels.map((c) => ({ value: c.id, label: c.label }))}
          required
        />
        <Select
          label="الحالة"
          value={values.status}
          onChange={(v) =>
            setValues((p) => (p ? { ...p, status: v as CommunicationTemplateFormValues["status"] } : p))
          }
          options={STATUS_OPTIONS}
          required
        />

        <div className="mt-2 flex items-center justify-end gap-3">
          <Link
            to="/admin/communications/templates"
            className="rounded-full px-5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-beige"
          >
            إلغاء
          </Link>
          <button
            type="button"
            onClick={save}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
          >
            حفظ التغييرات
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg text-ink">المحتوى</h2>
            <p className="mt-1 text-xs text-ink-faint">
              إدارة أقسام المحتوى فقط — لا يوجد محرر مرئي أو سحب وإفلات في هذه المرحلة.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-beige p-1">
              {EDITING_LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setEditingLanguage(option.value)}
                  className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                    editingLanguage === option.value ? "bg-ink text-ivory" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-beige px-5 py-2.5 text-sm text-ink transition-colors hover:bg-cream"
            >
              <IconEye className="h-4 w-4" />
              معاينة
            </button>
            <button
              type="button"
              onClick={openAddSection}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-deep"
            >
              <IconPlus className="h-4 w-4" />
              إضافة قسم
            </button>
          </div>
        </div>

        {sortedSections.length === 0 ? (
          <EmptyState
            icon={IconDocument}
            title="لا توجد أقسام بعد"
            description="أضيفي قسمًا (رأس، محتوى، زر، أو تذييل) لبدء بناء محتوى القالب."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {sortedSections.map((section, index) => (
              <div
                key={section.id}
                className="flex items-center justify-between gap-4 rounded-[10px] border border-beige bg-white/70 p-4"
              >
                <div className="min-w-0">
                  <span className="rounded-full bg-cream px-2.5 py-0.5 text-[11px] font-medium text-ink-soft">
                    {SECTION_TYPE_LABEL[section.type]}
                  </span>
                  <p className="mt-1.5 truncate text-sm text-ink">{previewFor(section, editingLanguage)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveSectionUp(template.id, section.id)}
                    aria-label="نقل لأعلى"
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-cream hover:text-ink disabled:pointer-events-none disabled:opacity-30"
                  >
                    <IconArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === sortedSections.length - 1}
                    onClick={() => moveSectionDown(template.id, section.id)}
                    aria-label="نقل لأسفل"
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-cream hover:text-ink disabled:pointer-events-none disabled:opacity-30"
                  >
                    <IconArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditSection(section)}
                    aria-label="تعديل القسم"
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-cream hover:text-ink"
                  >
                    <IconPencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(section)}
                    aria-label="حذف القسم"
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TemplateSectionFormModal
        open={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        initialSection={editingSection}
        editingLanguage={editingLanguage}
        onSave={({ type, fields }) => {
          if (editingSection) {
            updateSection(template.id, editingSection.id, fields);
          } else {
            addSection(template.id, type, fields);
          }
          setSectionModalOpen(false);
        }}
      />

      <TemplatePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        sections={previewSections}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف القسم"
        description="هل تريدين حذف هذا القسم؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف نهائي"
        onConfirm={() => {
          if (deleteTarget) deleteSection(template.id, deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

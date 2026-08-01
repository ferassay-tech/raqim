import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { AdminArticleRaw, ArticleStatus } from "@/admin/types/article";
import { ARTICLE_AUTHORS } from "@/admin/types/article";
import type { LocalizedText } from "@/admin/types/siteContent";
import type { Language } from "@/context/LanguageContext";
import { ARTICLE_STATUS_META, ARTICLE_STATUS_OPTIONS, estimateReadingMinutes } from "@/admin/lib/articleStatus";
import { Drawer } from "@/admin/components/ui/Drawer";
import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { TextField } from "@/admin/components/forms/TextField";
import { TextArea } from "@/admin/components/forms/TextArea";
import { Select } from "@/admin/components/forms/Select";
import { SegmentedControl } from "@/admin/components/forms/SegmentedControl";
import { FileDropzone } from "@/admin/components/forms/FileDropzone";
import { MediaPickerModal } from "@/admin/modules/media/components/MediaPickerModal";
import { ArticlePreviewDrawer } from "./ArticlePreviewDrawer";
import { IconChevronStart, IconEye, IconGear, IconTrash } from "@/admin/icons";

export type ArticleFormValues = Omit<AdminArticleRaw, "id" | "updatedAt">;

const EMPTY_LOCALIZED: LocalizedText = { ar: "", en: "" };

const EMPTY_ARTICLE: ArticleFormValues = {
  title: { ...EMPTY_LOCALIZED },
  slug: "",
  excerpt: { ...EMPTY_LOCALIZED },
  content: { ...EMPTY_LOCALIZED },
  coverImage: null,
  author: ARTICLE_AUTHORS[0],
  category: { ...EMPTY_LOCALIZED },
  readTime: "",
  status: "draft",
  scheduledFor: null,
  publishedAt: null,
  seoTitle: { ...EMPTY_LOCALIZED },
  seoDescription: { ...EMPTY_LOCALIZED },
};

const EDITING_LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
];

function slugify(title: string) {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/(^-|-$)/g, "")
  );
}

interface ArticleEditorProps {
  mode: "create" | "edit";
  initialArticle?: AdminArticleRaw;
  onSave: (values: ArticleFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

/**
 * The flagship content-editing experience — deliberately NOT a boxed,
 * tabbed form like BookForm. Title and body are the whole page; every
 * organizational field (slug, excerpt, cover, author, publish schedule,
 * SEO) lives behind the settings Drawer so the writing surface stays
 * distraction-free, closer to Ghost/Notion than a database record editor.
 *
 * Copy fields are bilingual ({ar, en}); the AR/EN toggle in the header
 * scopes every field's editing to one language at a time. Slug generation
 * always keys off the Arabic title, regardless of which language is being
 * edited — the slug is a stable identifier, not translated content.
 */
export function ArticleEditor({ mode, initialArticle, onSave, onCancel, onDelete }: ArticleEditorProps) {
  const initialValues: ArticleFormValues = initialArticle ?? EMPTY_ARTICLE;
  const [values, setValues] = useState<ArticleFormValues>(initialValues);
  const [editingLanguage, setEditingLanguage] = useState<Language>("ar");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const displayTitle = values.title.ar || values.title.en;
  const currentContent = values.content[editingLanguage];
  const readingMinutes = useMemo(() => estimateReadingMinutes(currentContent), [currentContent]);
  const wordCount = useMemo(() => currentContent.trim().split(/\s+/).filter(Boolean).length, [currentContent]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const set = <K extends keyof ArticleFormValues>(key: K, value: ArticleFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const setLocalized = (key: "title" | "excerpt" | "content" | "category" | "seoTitle" | "seoDescription", value: string) => {
    setValues((prev) => ({ ...prev, [key]: { ...prev[key], [editingLanguage]: value } }));
  };

  const handleTitleChange = (title: string) => {
    setLocalized("title", title);
    // Slug always tracks the Arabic title specifically — typing an English
    // title (or any title once the admin has manually edited the slug)
    // never touches it.
    if (!slugTouched && editingLanguage === "ar") set("slug", slugify(title));
  };

  const handleFileSelected = (file: File) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    set("coverImage", url);
  };

  const handleCancelClick = () => {
    if (isDirty) setConfirmCancel(true);
    else onCancel();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!values.title.ar.trim()) {
      setEditingLanguage("ar");
      setSettingsOpen(false);
      return;
    }
    const publishedAt =
      values.status === "published" ? values.publishedAt ?? new Date().toISOString().slice(0, 10) : values.publishedAt;
    onSave({ ...values, slug: values.slug || slugify(values.title.ar), publishedAt });
  };

  const primaryLabel =
    mode === "edit"
      ? "حفظ التغييرات"
      : values.status === "published"
        ? "نشر المقالة"
        : values.status === "scheduled"
          ? "جدولة المقالة"
          : "حفظ كمسودة";

  const statusMeta = ARTICLE_STATUS_META[values.status];

  const previewArticle = previewOpen
    ? {
        title: values.title[editingLanguage],
        excerpt: values.excerpt[editingLanguage],
        content: values.content[editingLanguage],
        coverImage: values.coverImage,
        author: values.author,
        status: values.status,
      }
    : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleCancelClick}
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
        >
          <IconChevronStart className="h-3.5 w-3.5 rotate-180" />
          المقالات
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge variant={statusMeta.variant}>{statusMeta.label}</StatusBadge>
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
            className="inline-flex items-center gap-1.5 rounded-full border border-beige px-4 py-2 text-xs text-ink-soft transition-colors hover:border-gold hover:text-ink"
          >
            <IconEye className="h-3.5 w-3.5" />
            معاينة
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-beige px-4 py-2 text-xs text-ink-soft transition-colors hover:border-gold hover:text-ink"
          >
            <IconGear className="h-3.5 w-3.5" />
            إعدادات المقالة
          </button>
          <button
            type="submit"
            className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
          >
            {primaryLabel}
          </button>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        <textarea
          value={values.title[editingLanguage]}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="عنوان المقالة"
          rows={1}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
          }}
          className="resize-none overflow-hidden border-none bg-transparent font-display text-4xl leading-snug text-ink placeholder:text-ink-faint/60 focus:outline-none"
        />

        <textarea
          value={values.content[editingLanguage]}
          onChange={(e) => setLocalized("content", e.target.value)}
          placeholder="ابدئي الكتابة هنا..."
          rows={16}
          className="min-h-[50vh] resize-none border-none bg-transparent text-lg leading-loose text-ink-soft placeholder:text-ink-faint/60 focus:outline-none"
        />

        <p className="text-xs text-ink-faint">
          {wordCount.toLocaleString("en-US")} كلمة · {readingMinutes} دقائق قراءة تقريبًا
        </p>
      </div>

      <Drawer open={settingsOpen} onClose={() => setSettingsOpen(false)} title="إعدادات المقالة">
        <div className="flex flex-col gap-7">
          <section className="flex flex-col gap-4">
            <h3 className="text-xs uppercase tracking-[0.15em] text-ink-faint">النشر</h3>
            <SegmentedControl
              label="الحالة"
              value={values.status}
              onChange={(v) => set("status", v as ArticleStatus)}
              options={ARTICLE_STATUS_OPTIONS}
            />
            {values.status === "scheduled" && (
              <TextField
                label="تاريخ النشر المجدول"
                type="date"
                value={values.scheduledFor ?? ""}
                onChange={(v) => set("scheduledFor", v || null)}
              />
            )}
            <Select
              label="الكاتبة"
              value={values.author}
              onChange={(v) => set("author", v)}
              options={ARTICLE_AUTHORS.map((a) => ({ value: a, label: a }))}
            />
          </section>

          <section className="flex flex-col gap-4 border-t border-beige pt-6">
            <h3 className="text-xs uppercase tracking-[0.15em] text-ink-faint">التصنيف ووقت القراءة</h3>
            <TextField
              label="التصنيف"
              value={values.category[editingLanguage]}
              onChange={(v) => setLocalized("category", v)}
              placeholder="مثال: الأمومة"
            />
            <TextField
              label="وقت القراءة"
              value={values.readTime}
              onChange={(v) => set("readTime", v)}
              placeholder="مثال: ٦ دقائق"
              hint={`${wordCount.toLocaleString("en-US")} كلمة · تقدير تلقائي: ${readingMinutes} دقائق`}
            />
          </section>

          <section className="flex flex-col gap-4 border-t border-beige pt-6">
            <h3 className="text-xs uppercase tracking-[0.15em] text-ink-faint">الرابط والملخص</h3>
            <TextField
              label="الرابط (Slug)"
              value={values.slug}
              onChange={(v) => {
                setSlugTouched(true);
                set("slug", slugify(v));
              }}
              dir="ltr"
              hint="يُستخدم في رابط المقالة العام"
            />
            <TextArea
              label="الملخص"
              rows={3}
              value={values.excerpt[editingLanguage]}
              onChange={(v) => setLocalized("excerpt", v)}
              placeholder="سطر أو سطران يلخصان المقالة لعرضها في القائمة"
            />
          </section>

          <section className="border-t border-beige pt-6">
            <FileDropzone
              label="صورة الغلاف"
              previewUrl={values.coverImage}
              onFileSelected={handleFileSelected}
              onClear={() => set("coverImage", null)}
              onBrowseLibrary={() => setMediaPickerOpen(true)}
            />
          </section>

          <section className="flex flex-col gap-4 border-t border-beige pt-6">
            <h3 className="text-xs uppercase tracking-[0.15em] text-ink-faint">السيو</h3>
            <TextField
              label="عنوان السيو"
              value={values.seoTitle[editingLanguage]}
              onChange={(v) => setLocalized("seoTitle", v)}
              placeholder={values.title[editingLanguage] ? `${values.title[editingLanguage]} — مدونة رقيم` : undefined}
            />
            <TextArea
              label="وصف السيو"
              rows={3}
              value={values.seoDescription[editingLanguage]}
              onChange={(v) => setLocalized("seoDescription", v)}
              maxLength={160}
            />
          </section>

          {mode === "edit" && onDelete && (
            <section className="border-t border-beige pt-6">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
              >
                <IconTrash className="h-4 w-4" />
                حذف المقالة
              </button>
            </section>
          )}
        </div>
      </Drawer>

      <ArticlePreviewDrawer article={previewArticle} onClose={() => setPreviewOpen(false)} />

      <MediaPickerModal
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(asset) => {
          set("coverImage", asset.url);
          setMediaPickerOpen(false);
        }}
      />

      <ConfirmDialog
        open={confirmCancel}
        title="تجاهل التغييرات؟"
        description="لديك تغييرات غير محفوظة. هل تريدين مغادرة الصفحة دون حفظها؟"
        confirmLabel="تجاهل التغييرات"
        tone="danger"
        onConfirm={onCancel}
        onCancel={() => setConfirmCancel(false)}
      />

      {onDelete && (
        <ConfirmDialog
          open={confirmDelete}
          title="حذف المقالة"
          description={`هل تريدين حذف «${displayTitle}»؟ لا يمكن التراجع عن هذا الإجراء.`}
          confirmLabel="حذف نهائي"
          onConfirm={onDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </form>
  );
}

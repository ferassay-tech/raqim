import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type {
  AdminBook,
  BookChapter,
  BookCurrency,
  BookFaqItem,
  BookFeature,
  BookPlacement,
  BookReview,
  BookStatus,
} from "../../types/book";
import { BOOK_FEATURE_ICONS, CURRENCY_LABELS } from "../../types/book";
import { BOOK_PLACEMENT_OPTIONS } from "../../lib/bookPlacement";
import { useCategories } from "../../context/CategoriesContext";
import { Tabs } from "../Tabs";
import { TextField } from "../form/TextField";
import { TextArea } from "../form/TextArea";
import { Select } from "../form/Select";
import { SegmentedControl } from "../form/SegmentedControl";
import { FileDropzone } from "../form/FileDropzone";
import { Repeater } from "../form/Repeater";
import { ImageListEditor } from "../form/ImageListEditor";
import { ConfirmDialog } from "../ConfirmDialog";
import { MediaPickerModal } from "../media/MediaPickerModal";
import { IconTrash } from "../../icons";

export type BookFormValues = Omit<AdminBook, "id" | "sales" | "updatedAt">;

const EMPTY_BOOK: BookFormValues = {
  title: "",
  subtitle: "",
  author: "",
  authorSlug: "",
  authorBio: "",
  category: "",
  cover: null,
  backCoverImage: null,
  previewPages: [],
  gallery: [],
  placement: "hidden",
  displayOrder: 1,
  prices: {},
  stock: 999,
  sku: "",
  status: "draft",
  language: "العربية",
  format: "كتاب رقمي PDF فاخر",
  pages: 0,
  description: "",
  longDescription: "",
  whoFor: [],
  features: [],
  chapters: [],
  reviews: [],
  faq: [],
  ctaLabel: "اطلبي نسختك الآن",
  badges: [],
  accentColor: null,
  seoTitle: "",
  seoDescription: "",
  deletedAt: null,
};

const TABS = [
  { key: "hero", label: "البطل" },
  { key: "whoFor", label: "لمن هذا الكتاب" },
  { key: "story", label: "القصة" },
  { key: "chapters", label: "الفصول" },
  { key: "features", label: "المزايا" },
  { key: "reviews", label: "آراء القارئات" },
  { key: "pricing", label: "التسعير والمخزون" },
  { key: "media", label: "الغلاف والمعرض" },
  { key: "faq", label: "الأسئلة الشائعة" },
  { key: "seo", label: "السيو" },
];

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: "draft", label: "مسودة" },
  { value: "published", label: "منشور" },
  { value: "archived", label: "مؤرشف" },
];

const CURRENCIES: BookCurrency[] = ["USD", "EGP", "ILS"];

interface BookFormProps {
  mode: "create" | "edit";
  initialBook?: AdminBook;
  onSave: (values: BookFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function BookForm({ mode, initialBook, onSave, onCancel, onDelete }: BookFormProps) {
  const { categories } = useCategories();
  const initialValues: BookFormValues = initialBook ?? { ...EMPTY_BOOK, category: categories[0]?.name ?? "" };
  const [values, setValues] = useState<BookFormValues>(initialValues);
  const [activeTab, setActiveTab] = useState("hero");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [backCoverPickerOpen, setBackCoverPickerOpen] = useState(false);
  const coverObjectUrlRef = useRef<string | null>(null);

  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

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
      if (coverObjectUrlRef.current) URL.revokeObjectURL(coverObjectUrlRef.current);
    };
  }, []);

  const set = <K extends keyof BookFormValues>(key: K, value: BookFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleCoverFileSelected = (file: File) => {
    if (coverObjectUrlRef.current) URL.revokeObjectURL(coverObjectUrlRef.current);
    const url = URL.createObjectURL(file);
    coverObjectUrlRef.current = url;
    set("cover", url);
  };

  const handleCancelClick = () => {
    if (isDirty) setConfirmCancel(true);
    else onCancel();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!values.title.trim()) {
      setActiveTab("hero");
      return;
    }
    onSave(values);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-[10px] border border-beige bg-white/70 backdrop-blur">
        <div className="px-6 pt-2">
          <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </div>

        <div className="px-6 py-7">
          {activeTab === "hero" && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextField label="عنوان الكتاب" value={values.title} onChange={(v) => set("title", v)} required />
              </div>
              <div className="sm:col-span-2">
                <TextField label="العنوان الفرعي" value={values.subtitle} onChange={(v) => set("subtitle", v)} />
              </div>
              <TextField label="المؤلفة" value={values.author} onChange={(v) => set("author", v)} required />
              <TextField
                label="رابط صفحة المؤلفة (Slug)"
                value={values.authorSlug}
                onChange={(v) => set("authorSlug", v)}
                dir="ltr"
                hint="يُستخدم في رابط /authors/..."
              />
              <div className="sm:col-span-2">
                <TextArea
                  label="نبذة عن المؤلفة (تظهر في صفحة هذا الكتاب)"
                  rows={3}
                  value={values.authorBio}
                  onChange={(v) => set("authorBio", v)}
                />
              </div>
              <Select
                label="التصنيف"
                value={values.category}
                onChange={(v) => set("category", v)}
                options={categories.map((c) => ({ value: c.name, label: c.name }))}
              />
              <Select
                label="الظهور على الموقع"
                value={values.placement}
                onChange={(v) => set("placement", v as BookPlacement)}
                options={BOOK_PLACEMENT_OPTIONS}
              />
              <TextField
                label="ترتيب العرض"
                type="number"
                value={String(values.displayOrder)}
                onChange={(v) => set("displayOrder", Number(v) || 0)}
                hint="الأصغر يظهر أولًا"
              />
              <div className="sm:col-span-2">
                <TextField label="نص زر الشراء (CTA)" value={values.ctaLabel} onChange={(v) => set("ctaLabel", v)} />
              </div>
              <div className="sm:col-span-2">
                <Repeater<string>
                  label="الشارات"
                  items={values.badges}
                  onChange={(v) => set("badges", v)}
                  newItem={() => ""}
                  addLabel="إضافة شارة"
                  emptyLabel="لا توجد شارات بعد."
                  renderItem={(item, update) => (
                    <TextField label="نص الشارة" value={item} onChange={update} placeholder="مثال: إصدار رقيم الأول" />
                  )}
                />
              </div>
            </div>
          )}

          {activeTab === "whoFor" && (
            <Repeater<string>
              label="لمن هذا الكتاب"
              items={values.whoFor}
              onChange={(v) => set("whoFor", v)}
              newItem={() => ""}
              addLabel="إضافة سطر"
              emptyLabel="لا توجد عناصر بعد."
              renderItem={(item, update) => (
                <TextArea label="الوصف" rows={2} value={item} onChange={update} />
              )}
            />
          )}

          {activeTab === "story" && (
            <div className="flex flex-col gap-5">
              <TextArea
                label="نبذة قصيرة (الوصف)"
                rows={4}
                value={values.description}
                onChange={(v) => set("description", v)}
                placeholder="نبذة عن الكتاب تظهر في القوائم وبطاقات الكتب..."
              />
              <TextArea
                label="القصة الكاملة"
                rows={8}
                value={values.longDescription}
                onChange={(v) => set("longDescription", v)}
                placeholder="القصة الموسعة التي تظهر في قسم «رحلة التحول» بصفحة الكتاب..."
              />
            </div>
          )}

          {activeTab === "chapters" && (
            <Repeater<BookChapter>
              label="الفصول"
              items={values.chapters}
              onChange={(v) => set("chapters", v)}
              newItem={() => ({ number: String(values.chapters.length + 1), title: "" })}
              addLabel="إضافة فصل"
              emptyLabel="لا توجد فصول بعد."
              renderItem={(item, update) => (
                <div className="grid grid-cols-[80px_1fr] gap-3">
                  <TextField label="الرقم" value={item.number} onChange={(v) => update({ ...item, number: v })} />
                  <TextField label="عنوان الفصل" value={item.title} onChange={(v) => update({ ...item, title: v })} />
                </div>
              )}
            />
          )}

          {activeTab === "features" && (
            <Repeater<BookFeature>
              label="المزايا"
              items={values.features}
              onChange={(v) => set("features", v)}
              newItem={() => ({ icon: BOOK_FEATURE_ICONS[0].value, title: "", body: "" })}
              addLabel="إضافة ميزة"
              emptyLabel="لا توجد مزايا بعد."
              renderItem={(item, update) => (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[160px_1fr]">
                    <Select
                      label="الأيقونة"
                      value={item.icon}
                      onChange={(v) => update({ ...item, icon: v })}
                      options={[...BOOK_FEATURE_ICONS]}
                    />
                    <TextField label="العنوان" value={item.title} onChange={(v) => update({ ...item, title: v })} />
                  </div>
                  <TextArea label="الوصف" rows={2} value={item.body} onChange={(v) => update({ ...item, body: v })} />
                </div>
              )}
            />
          )}

          {activeTab === "reviews" && (
            <Repeater<BookReview>
              label="آراء القارئات"
              items={values.reviews}
              onChange={(v) => set("reviews", v)}
              newItem={() => ({ quote: "", name: "", role: "" })}
              addLabel="إضافة رأي"
              emptyLabel="لا توجد آراء بعد."
              renderItem={(item, update) => (
                <div className="flex flex-col gap-3">
                  <TextArea label="النص" rows={2} value={item.quote} onChange={(v) => update({ ...item, quote: v })} />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <TextField label="الاسم" value={item.name} onChange={(v) => update({ ...item, name: v })} />
                    <TextField label="الوصف" value={item.role} onChange={(v) => update({ ...item, role: v })} />
                  </div>
                </div>
              )}
            />
          )}

          {activeTab === "pricing" && (
            <div className="flex flex-col gap-6">
              {CURRENCIES.map((currency) => {
                const entry = values.prices[currency];
                const enabled = Boolean(entry);
                return (
                  <div key={currency} className="rounded-[10px] border border-beige bg-cream/30 p-4">
                    <label className="flex items-center gap-2 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) =>
                          set("prices", {
                            ...values.prices,
                            [currency]: e.target.checked ? { price: 0, compareAtPrice: null } : undefined,
                          })
                        }
                        className="h-4 w-4 rounded border-beige accent-gold-deep"
                      />
                      {CURRENCY_LABELS[currency]}
                    </label>
                    {enabled && entry && (
                      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <TextField
                          label="السعر"
                          type="number"
                          value={String(entry.price)}
                          onChange={(v) =>
                            set("prices", { ...values.prices, [currency]: { ...entry, price: Number(v) || 0 } })
                          }
                        />
                        <TextField
                          label="السعر قبل الخصم — اختياري"
                          type="number"
                          value={entry.compareAtPrice === null ? "" : String(entry.compareAtPrice)}
                          onChange={(v) =>
                            set("prices", {
                              ...values.prices,
                              [currency]: { ...entry, compareAtPrice: v === "" ? null : Number(v) || 0 },
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="grid grid-cols-1 gap-5 border-t border-beige pt-5 sm:grid-cols-2">
                <TextField label="رمز المنتج (SKU)" value={values.sku} onChange={(v) => set("sku", v)} />
                <TextField
                  label="المخزون"
                  type="number"
                  value={String(values.stock)}
                  onChange={(v) => set("stock", Number(v) || 0)}
                  hint="للكتب الرقمية غير المحدودة، يمكن ترك رقم مرتفع."
                />
                <div className="sm:col-span-2">
                  <SegmentedControl
                    label="حالة النشر"
                    value={values.status}
                    onChange={(v) => set("status", v as BookStatus)}
                    options={STATUS_OPTIONS}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "media" && (
            <div className="flex flex-col gap-7">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FileDropzone
                  label="الغلاف الأمامي"
                  hint="يُفضّل قياس 1000×1400 بكسل تقريبًا"
                  previewUrl={values.cover}
                  onFileSelected={handleCoverFileSelected}
                  onClear={() => set("cover", null)}
                  onBrowseLibrary={() => setCoverPickerOpen(true)}
                />
                <FileDropzone
                  label="الغلاف الخلفي — اختياري"
                  previewUrl={values.backCoverImage}
                  onFileSelected={(file) => set("backCoverImage", URL.createObjectURL(file))}
                  onClear={() => set("backCoverImage", null)}
                  onBrowseLibrary={() => setBackCoverPickerOpen(true)}
                />
              </div>

              <ImageListEditor
                label="معرض الصور"
                hint="تظهر في صفحة الكتاب كصور إضافية"
                images={values.gallery}
                onChange={(v) => set("gallery", v)}
              />

              <ImageListEditor
                label="صفحات المعاينة (فتح الكتاب)"
                hint="تظهر عند تقليب الكتاب في الصفحة الرئيسية وصفحة الكتاب"
                images={values.previewPages}
                onChange={(v) => set("previewPages", v)}
              />
            </div>
          )}

          {activeTab === "faq" && (
            <Repeater<BookFaqItem>
              label="الأسئلة الشائعة"
              items={values.faq}
              onChange={(v) => set("faq", v)}
              newItem={() => ({ question: "", answer: "" })}
              addLabel="إضافة سؤال"
              emptyLabel="لا توجد أسئلة بعد."
              renderItem={(item, update) => (
                <div className="flex flex-col gap-3">
                  <TextField label="السؤال" value={item.question} onChange={(v) => update({ ...item, question: v })} />
                  <TextArea label="الإجابة" rows={2} value={item.answer} onChange={(v) => update({ ...item, answer: v })} />
                </div>
              )}
            />
          )}

          {activeTab === "seo" && (
            <div className="flex max-w-xl flex-col gap-5">
              <TextField
                label="عنوان السيو"
                value={values.seoTitle}
                onChange={(v) => set("seoTitle", v)}
                placeholder={values.title ? `${values.title} — رقيم` : undefined}
              />
              <TextArea
                label="وصف السيو"
                rows={3}
                value={values.seoDescription}
                onChange={(v) => set("seoDescription", v)}
                maxLength={160}
                hint="يظهر هذا الوصف في نتائج البحث ومشاركات التواصل الاجتماعي."
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          {mode === "edit" && onDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
            >
              <IconTrash className="h-4 w-4" />
              حذف الكتاب
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancelClick}
            className="rounded-full px-5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-beige"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
          >
            {mode === "create" ? "إضافة الكتاب" : "حفظ التغييرات"}
          </button>
        </div>
      </div>

      <MediaPickerModal
        open={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        onSelect={(asset) => {
          set("cover", asset.url);
          setCoverPickerOpen(false);
        }}
      />
      <MediaPickerModal
        open={backCoverPickerOpen}
        onClose={() => setBackCoverPickerOpen(false)}
        onSelect={(asset) => {
          set("backCoverImage", asset.url);
          setBackCoverPickerOpen(false);
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
          title="حذف الكتاب"
          description={`هل تريدين نقل «${values.title}» إلى المحذوفات؟ يمكنك استعادته لاحقًا من صفحة الكتب.`}
          confirmLabel="نقل إلى المحذوفات"
          tone="danger"
          onConfirm={onDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </form>
  );
}

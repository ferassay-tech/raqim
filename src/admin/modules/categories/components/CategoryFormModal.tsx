import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { AdminCategoryRaw } from "@/admin/types/category";
import type { LocalizedText } from "@/admin/types/siteContent";
import type { Language } from "@/context/LanguageContext";
import { Modal } from "@/admin/components/ui/Modal";
import { Button } from "@/admin/components/ui/Button";
import { TextField } from "@/admin/components/forms/TextField";
import { TextArea } from "@/admin/components/forms/TextArea";

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: Omit<AdminCategoryRaw, "id">) => void | Promise<void>;
  initialCategory?: AdminCategoryRaw | null;
  /** Every other category (raw, bilingual) — for the per-language duplicate
   * name check. Includes the category being edited; it's excluded by id. */
  existingCategories: AdminCategoryRaw[];
}

const EMPTY_LOCALIZED: LocalizedText = { ar: "", en: "" };
const EMPTY: Omit<AdminCategoryRaw, "id"> = { name: { ...EMPTY_LOCALIZED }, description: { ...EMPTY_LOCALIZED } };

const EDITING_LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
];

export function CategoryFormModal({
  open,
  onClose,
  onSave,
  initialCategory,
  existingCategories,
}: CategoryFormModalProps) {
  const [values, setValues] = useState(EMPTY);
  const [editingLanguage, setEditingLanguage] = useState<Language>("ar");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initialCategory ? { name: initialCategory.name, description: initialCategory.description } : EMPTY);
      setEditingLanguage("ar");
      setError(null);
    }
  }, [open, initialCategory]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    const trimmedAr = values.name.ar.trim();
    if (!trimmedAr) {
      setEditingLanguage("ar");
      setError("اسم التصنيف مطلوب.");
      return;
    }

    const trimmedCurrent = values.name[editingLanguage].trim();
    const isDuplicate =
      trimmedCurrent !== "" &&
      existingCategories.some((c) => {
        if (c.id === initialCategory?.id) return false;
        const other = c.name[editingLanguage].trim();
        return other !== "" && other.toLowerCase() === trimmedCurrent.toLowerCase();
      });
    if (isDuplicate) {
      setError("يوجد تصنيف بهذا الاسم بالفعل.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: { ar: trimmedAr, en: values.name.en.trim() },
        description: { ar: values.description.ar.trim(), en: values.description.en.trim() },
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialCategory ? "تعديل التصنيف" : "تصنيف جديد"}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-beige"
          >
            إلغاء
          </button>
          <Button type="submit" form="category-form" variant="primary" loading={isSaving} className="!px-5">
            {initialCategory ? "حفظ التغييرات" : "إضافة التصنيف"}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-1 self-start rounded-full border border-beige p-1">
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

        <div>
          <TextField
            label="اسم التصنيف"
            value={values.name[editingLanguage]}
            onChange={(v) => {
              setValues((p) => ({ ...p, name: { ...p.name, [editingLanguage]: v } }));
              setError(null);
            }}
            required={editingLanguage === "ar"}
          />
          {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
        </div>
        <TextArea
          label="الوصف"
          rows={3}
          value={values.description[editingLanguage]}
          onChange={(v) => setValues((p) => ({ ...p, description: { ...p.description, [editingLanguage]: v } }))}
          placeholder="وصف مختصر يوضح طبيعة الكتب ضمن هذا التصنيف"
        />
      </form>
    </Modal>
  );
}

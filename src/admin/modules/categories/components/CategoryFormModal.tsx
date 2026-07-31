import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { AdminCategory } from "@/admin/types/category";
import { Modal } from "@/admin/components/ui/Modal";
import { TextField } from "@/admin/components/forms/TextField";
import { TextArea } from "@/admin/components/forms/TextArea";

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: Omit<AdminCategory, "id">) => void;
  initialCategory?: AdminCategory | null;
  existingNames: string[];
}

const EMPTY = { name: "", description: "" };

export function CategoryFormModal({
  open,
  onClose,
  onSave,
  initialCategory,
  existingNames,
}: CategoryFormModalProps) {
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(initialCategory ? { name: initialCategory.name, description: initialCategory.description } : EMPTY);
      setError(null);
    }
  }, [open, initialCategory]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = values.name.trim();
    if (!trimmed) {
      setError("اسم التصنيف مطلوب.");
      return;
    }
    const isDuplicate = existingNames.some(
      (name) => name.trim().toLowerCase() === trimmed.toLowerCase() && name !== initialCategory?.name
    );
    if (isDuplicate) {
      setError("يوجد تصنيف بهذا الاسم بالفعل.");
      return;
    }
    onSave({ name: trimmed, description: values.description.trim() });
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
          <button
            type="submit"
            form="category-form"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
          >
            {initialCategory ? "حفظ التغييرات" : "إضافة التصنيف"}
          </button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <TextField
            label="اسم التصنيف"
            value={values.name}
            onChange={(v) => {
              setValues((p) => ({ ...p, name: v }));
              setError(null);
            }}
            required
          />
          {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
        </div>
        <TextArea
          label="الوصف"
          rows={3}
          value={values.description}
          onChange={(v) => setValues((p) => ({ ...p, description: v }))}
          placeholder="وصف مختصر يوضح طبيعة الكتب ضمن هذا التصنيف"
        />
      </form>
    </Modal>
  );
}

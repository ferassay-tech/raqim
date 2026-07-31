import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { CommunicationTemplateFormValues } from "@/admin/context/CommunicationTemplatesContext";
import type { CommunicationCategory } from "../types/category";
import { listChannels } from "../services/channelRegistry";
import { Modal } from "@/admin/components/ui/Modal";
import { TextField } from "@/admin/components/forms/TextField";
import { TextArea } from "@/admin/components/forms/TextArea";
import { Select } from "@/admin/components/forms/Select";

interface CommunicationTemplateFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: CommunicationTemplateFormValues) => void;
  categories: CommunicationCategory[];
}

const EMPTY: CommunicationTemplateFormValues = {
  name: "",
  description: "",
  categoryId: null,
  channelId: "email",
  status: "draft",
};

const STATUS_OPTIONS = [
  { value: "draft", label: "مسودة" },
  { value: "published", label: "منشور" },
  { value: "archived", label: "مؤرشف" },
];

/** Quick creation only — editing an existing template's metadata happens on
 * its own page (CommunicationTemplateEditorPage), not through this modal. */
export function CommunicationTemplateFormModal({
  open,
  onClose,
  onSave,
  categories,
}: CommunicationTemplateFormModalProps) {
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const channels = listChannels();

  useEffect(() => {
    if (open) {
      setValues(EMPTY);
      setError(null);
    }
  }, [open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = values.name.trim();
    if (!trimmed) {
      setError("اسم القالب مطلوب.");
      return;
    }
    onSave({ ...values, name: trimmed, description: values.description.trim() });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="قالب جديد"
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
            form="communication-template-form"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
          >
            إنشاء القالب
          </button>
        </>
      }
    >
      <form id="communication-template-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <TextField
            label="اسم القالب"
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
          rows={2}
          value={values.description}
          onChange={(v) => setValues((p) => ({ ...p, description: v }))}
        />
        <Select
          label="التصنيف"
          value={values.categoryId ?? ""}
          onChange={(v) => setValues((p) => ({ ...p, categoryId: v || null }))}
          options={[{ value: "", label: "بدون تصنيف" }, ...categories.map((c) => ({ value: c.id, label: c.label }))]}
        />
        <Select
          label="القناة"
          value={values.channelId}
          onChange={(v) => setValues((p) => ({ ...p, channelId: v as CommunicationTemplateFormValues["channelId"] }))}
          options={channels.map((c) => ({ value: c.id, label: c.label }))}
          required
        />
        <Select
          label="الحالة"
          value={values.status}
          onChange={(v) => setValues((p) => ({ ...p, status: v as CommunicationTemplateFormValues["status"] }))}
          options={STATUS_OPTIONS}
          required
        />
      </form>
    </Modal>
  );
}

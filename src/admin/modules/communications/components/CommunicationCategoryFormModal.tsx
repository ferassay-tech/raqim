import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { CommunicationCategory } from "../types/category";
import type { CommunicationChannelId } from "../types/channel";
import { listChannels } from "../services/channelRegistry";
import { Modal } from "@/admin/components/ui/Modal";
import { TextField } from "@/admin/components/forms/TextField";
import { TextArea } from "@/admin/components/forms/TextArea";

interface CommunicationCategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: Omit<CommunicationCategory, "id">) => void;
  initialCategory?: CommunicationCategory | null;
  existingLabels: string[];
}

const EMPTY = { label: "", description: "", channelIds: [] as CommunicationChannelId[] };

export function CommunicationCategoryFormModal({
  open,
  onClose,
  onSave,
  initialCategory,
  existingLabels,
}: CommunicationCategoryFormModalProps) {
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const channels = listChannels();

  useEffect(() => {
    if (open) {
      setValues(
        initialCategory
          ? {
              label: initialCategory.label,
              description: initialCategory.description,
              channelIds: initialCategory.channelIds,
            }
          : EMPTY
      );
      setError(null);
    }
  }, [open, initialCategory]);

  const toggleChannel = (id: CommunicationChannelId) => {
    setValues((prev) => ({
      ...prev,
      channelIds: prev.channelIds.includes(id)
        ? prev.channelIds.filter((c) => c !== id)
        : [...prev.channelIds, id],
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = values.label.trim();
    if (!trimmed) {
      setError("اسم التصنيف مطلوب.");
      return;
    }
    const isDuplicate = existingLabels.some(
      (label) => label.trim().toLowerCase() === trimmed.toLowerCase() && label !== initialCategory?.label
    );
    if (isDuplicate) {
      setError("يوجد تصنيف بهذا الاسم بالفعل.");
      return;
    }
    onSave({ label: trimmed, description: values.description.trim(), channelIds: values.channelIds });
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
            form="communication-category-form"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
          >
            {initialCategory ? "حفظ التغييرات" : "إضافة التصنيف"}
          </button>
        </>
      }
    >
      <form id="communication-category-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <TextField
            label="اسم التصنيف"
            value={values.label}
            onChange={(v) => {
              setValues((p) => ({ ...p, label: v }));
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
        />
        <div>
          <span className="mb-2 block text-sm text-ink">القنوات المرتبطة</span>
          <div className="flex flex-wrap gap-3">
            {channels.map((channel) => (
              <label key={channel.id} className="flex items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={values.channelIds.includes(channel.id)}
                  onChange={() => toggleChannel(channel.id)}
                  className="h-4 w-4 rounded border-beige accent-gold-deep"
                />
                {channel.label}
              </label>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { AdminCoupon, CouponType } from "@/admin/types/coupon";
import { Modal } from "@/admin/components/ui/Modal";
import { Button } from "@/admin/components/ui/Button";
import { TextField } from "@/admin/components/forms/TextField";
import { TextArea } from "@/admin/components/forms/TextArea";
import { SegmentedControl } from "@/admin/components/forms/SegmentedControl";
import { generateCouponCode } from "@/admin/lib/generateCouponCode";
import { IconRefresh } from "@/admin/icons";

interface CouponFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: Omit<AdminCoupon, "id" | "usageCount">) => void | Promise<void>;
  initialCoupon?: AdminCoupon | null;
  existingCodes: string[];
}

interface FormState {
  code: string;
  type: CouponType;
  value: string;
  minOrderValue: string;
  usageLimit: string;
  startsAt: string;
  expiresAt: string;
  enabled: string;
  description: string;
}

const emptyState = (): FormState => ({
  code: "",
  type: "percentage",
  value: "",
  minOrderValue: "",
  usageLimit: "",
  startsAt: "",
  expiresAt: "",
  enabled: "true",
  description: "",
});

const fromCoupon = (coupon: AdminCoupon): FormState => ({
  code: coupon.code,
  type: coupon.type,
  value: String(coupon.value),
  minOrderValue: coupon.minOrderValue === null ? "" : String(coupon.minOrderValue),
  usageLimit: coupon.usageLimit === null ? "" : String(coupon.usageLimit),
  startsAt: coupon.startsAt ?? "",
  expiresAt: coupon.expiresAt ?? "",
  enabled: String(coupon.enabled),
  description: coupon.description,
});

export function CouponFormModal({ open, onClose, onSave, initialCoupon, existingCodes }: CouponFormModalProps) {
  const [values, setValues] = useState<FormState>(emptyState());
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initialCoupon ? fromCoupon(initialCoupon) : emptyState());
      setError(null);
    }
  }, [open, initialCoupon]);

  const set = <K extends keyof FormState>(key: K, v: FormState[K]) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    const code = values.code.trim().toUpperCase();
    if (!code) {
      setError("كود الخصم مطلوب.");
      return;
    }
    const isDuplicate = existingCodes.some(
      (c) => c.toUpperCase() === code && c.toUpperCase() !== initialCoupon?.code.toUpperCase()
    );
    if (isDuplicate) {
      setError("يوجد كود بهذا الاسم بالفعل.");
      return;
    }
    const value = Number(values.value);
    if (!value || value <= 0) {
      setError("قيمة الخصم يجب أن تكون أكبر من صفر.");
      return;
    }
    if (values.type === "percentage" && value > 100) {
      setError("نسبة الخصم يجب ألا تتجاوز ١٠٠٪.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        code,
        type: values.type,
        value,
        minOrderValue: values.minOrderValue ? Number(values.minOrderValue) : null,
        usageLimit: values.usageLimit ? Number(values.usageLimit) : null,
        startsAt: values.startsAt || null,
        expiresAt: values.expiresAt || null,
        enabled: values.enabled === "true",
        description: values.description.trim(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialCoupon ? "تعديل كود الخصم" : "كود خصم جديد"}
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-beige"
          >
            إلغاء
          </button>
          <Button type="submit" form="coupon-form" variant="primary" loading={isSaving} className="!px-5">
            {initialCoupon ? "حفظ التغييرات" : "إضافة الكود"}
          </Button>
        </>
      }
    >
      <form id="coupon-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <span className="mb-2 block text-sm text-ink">
            الكود <span className="text-danger">*</span>
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={values.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="RAQIM10"
              dir="ltr"
              className="w-full rounded-md border border-beige bg-ivory px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
            />
            <button
              type="button"
              onClick={() => set("code", generateCouponCode())}
              title="توليد كود عشوائي"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-beige text-ink-soft transition-colors hover:border-gold hover:text-ink"
            >
              <IconRefresh className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SegmentedControl
            label="نوع الخصم"
            value={values.type}
            onChange={(v) => set("type", v as CouponType)}
            options={[
              { value: "percentage", label: "نسبة مئوية" },
              { value: "fixed", label: "مبلغ ثابت" },
            ]}
          />
          <TextField
            label={values.type === "percentage" ? "النسبة (%)" : "القيمة ($)"}
            type="number"
            value={values.value}
            onChange={(v) => set("value", v)}
            required
          />
          <TextField
            label="الحد الأدنى للطلب ($) — اختياري"
            type="number"
            value={values.minOrderValue}
            onChange={(v) => set("minOrderValue", v)}
          />
          <TextField
            label="الحد الأقصى للاستخدام — اختياري"
            type="number"
            value={values.usageLimit}
            onChange={(v) => set("usageLimit", v)}
            hint="اتركيه فارغًا لاستخدام غير محدود"
          />
          <TextField label="تاريخ البدء — اختياري" type="date" value={values.startsAt} onChange={(v) => set("startsAt", v)} />
          <TextField
            label="تاريخ الانتهاء — اختياري"
            type="date"
            value={values.expiresAt}
            onChange={(v) => set("expiresAt", v)}
          />
        </div>

        <SegmentedControl
          label="الحالة"
          value={values.enabled}
          onChange={(v) => set("enabled", v)}
          options={[
            { value: "true", label: "فعّال" },
            { value: "false", label: "متوقف" },
          ]}
        />

        <TextArea
          label="الوصف"
          rows={2}
          value={values.description}
          onChange={(v) => set("description", v)}
          placeholder="وصف داخلي مختصر عن الغرض من هذا الكود"
        />

        {error && <p className="text-xs text-danger">{error}</p>}
      </form>
    </Modal>
  );
}

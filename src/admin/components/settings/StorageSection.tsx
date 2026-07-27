import { useSettings } from "../../context/SettingsContext";
import { STORAGE_PROVIDER_OPTIONS } from "../../services/storage";
import type { StorageProviderId } from "../../services/storage";
import { SettingsRow } from "./SettingsRow";

interface StorageSectionProps {
  onSaved: (message: string) => void;
}

export function StorageSection({ onSaved }: StorageSectionProps) {
  const { settings, updateStorage } = useSettings();
  const { activeProvider } = settings.storage;

  return (
    <div>
      <SettingsRow
        title="مزوّد التخزين"
        description="مزوّد التخزين النشط لملفات المكتبة الرقمية. يمكن إضافة مزوّدات حقيقية (Cloudflare R2, Amazon S3, Supabase Storage) لاحقًا دون تغيير أي شيء آخر في النظام — التخزين المحلي هو الخيار الوحيد الفعّال حاليًا."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {STORAGE_PROVIDER_OPTIONS.map((option) => {
            const active = option.value === activeProvider;
            const disabled = option.value !== "local";
            return (
              <button
                key={option.value}
                type="button"
                disabled={disabled}
                onClick={() => updateStorage({ activeProvider: option.value as StorageProviderId })}
                title={disabled ? "غير مُهيّأ بعد — يتطلب ربط حساب المزوّد الحقيقي" : undefined}
                className={`rounded-[10px] border p-4 text-right transition-colors ${
                  active ? "border-ink bg-ink text-ivory" : "border-beige text-ink-soft hover:border-gold hover:text-ink"
                } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <p className="text-sm font-medium">{option.label}</p>
                {disabled && <p className="mt-1 text-[11px]">غير مُهيّأ بعد</p>}
              </button>
            );
          })}
        </div>
      </SettingsRow>

      <div className="pt-6">
        <button
          type="button"
          onClick={() => onSaved("تم حفظ إعدادات التخزين")}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
        >
          حفظ التغييرات
        </button>
      </div>
    </div>
  );
}

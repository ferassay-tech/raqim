import { useSettings } from "../../context/SettingsContext";
import { STORAGE_PROVIDER_OPTIONS } from "../../services/storage";
import type { StorageProviderId } from "../../services/storage";
import { SettingsRow } from "./SettingsRow";

interface StorageSectionProps {
  onSaved: (message: string) => void;
}

export function StorageSection({ onSaved }: StorageSectionProps) {
  const { settings, updateStorage } = useSettings();
  const { activeProvider, downloadLinkExpiryDays, downloadLinkMaxDownloads } = settings.storage;

  const toNullableInt = (raw: string): number | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const n = Number.parseInt(trimmed, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  return (
    <div>
      <SettingsRow
        title="مزوّد التخزين"
        description="مزوّد التخزين النشط لملفات المكتبة الرقمية. Supabase Storage يوفّر تخزينًا حقيقيًا ودائمًا للملفات؛ يمكن إضافة مزوّدات أخرى (Cloudflare R2, Amazon S3) لاحقًا بنفس الطريقة دون تغيير أي شيء آخر في النظام."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {STORAGE_PROVIDER_OPTIONS.map((option) => {
            const active = option.value === activeProvider;
            const disabled = option.value !== "local" && option.value !== "supabase";
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

      <SettingsRow
        title="سياسة روابط التحميل"
        description="تُطبَّق هذه القيم على كل رابط تحميل جديد يتم توليده أو إعادة توليده — الروابط الصادرة مسبقًا تحتفظ بما مُنحت له وقت توليدها. اتركي الحقل فارغًا لإلغاء القيد (بلا انتهاء / بلا حد لعدد التحميلات)."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs text-ink-soft">مدة الصلاحية (بالأيام)</span>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={downloadLinkExpiryDays ?? ""}
              onChange={(e) => updateStorage({ downloadLinkExpiryDays: toNullableInt(e.target.value) })}
              placeholder="بلا انتهاء"
              dir="ltr"
              className="w-full rounded-[10px] border border-beige bg-ivory px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-ink-soft">الحد الأقصى لعدد مرات التحميل</span>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={downloadLinkMaxDownloads ?? ""}
              onChange={(e) => updateStorage({ downloadLinkMaxDownloads: toNullableInt(e.target.value) })}
              placeholder="بلا حد"
              dir="ltr"
              className="w-full rounded-[10px] border border-beige bg-ivory px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
            />
          </label>
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

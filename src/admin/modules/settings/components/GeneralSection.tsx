import { TextField } from "@/admin/components/forms/TextField";
import { TextArea } from "@/admin/components/forms/TextArea";
import { Select } from "@/admin/components/forms/Select";
import { useSettings } from "@/admin/context/SettingsContext";
import { SettingsRow } from "./SettingsRow";

interface GeneralSectionProps {
  onSaved: (message: string) => void;
}

export function GeneralSection({ onSaved }: GeneralSectionProps) {
  const { settings, updateGeneral } = useSettings();
  const { siteName, description, language, timezone } = settings.general;

  return (
    <div>
      <SettingsRow title="هوية الموقع" description="الاسم والوصف الظاهران في السيو ومشاركات التواصل الاجتماعي.">
        <div className="flex flex-col gap-6">
          <TextField label="اسم الموقع" value={siteName} onChange={(v) => updateGeneral({ siteName: v })} />
          <TextArea
            label="وصف الموقع"
            rows={3}
            value={description}
            onChange={(v) => updateGeneral({ description: v })}
          />
        </div>
      </SettingsRow>

      <SettingsRow title="اللغة والتوقيت" description="اللغة الافتراضية والمنطقة الزمنية المعتمدة في لوحة التحكم.">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Select
            label="اللغة الافتراضية"
            value={language}
            onChange={(v) => updateGeneral({ language: v as "ar" | "en" })}
            options={[
              { value: "ar", label: "العربية" },
              { value: "en", label: "الإنجليزية" },
            ]}
          />
          <Select
            label="المنطقة الزمنية"
            value={timezone}
            onChange={(v) => updateGeneral({ timezone: v })}
            options={[
              { value: "mecca", label: "توقيت مكة المكرمة (GMT+3)" },
              { value: "cairo", label: "توقيت القاهرة (GMT+2)" },
              { value: "dubai", label: "توقيت دبي (GMT+4)" },
            ]}
          />
        </div>
      </SettingsRow>

      <div className="pt-6">
        <button
          type="button"
          onClick={() => onSaved("تم حفظ الإعدادات العامة")}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
        >
          حفظ التغييرات
        </button>
      </div>
    </div>
  );
}

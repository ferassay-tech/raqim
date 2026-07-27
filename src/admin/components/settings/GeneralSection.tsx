import { TextField } from "../form/TextField";
import { TextArea } from "../form/TextArea";
import { Select } from "../form/Select";
import { useSettings } from "../../context/SettingsContext";

interface GeneralSectionProps {
  onSaved: (message: string) => void;
}

export function GeneralSection({ onSaved }: GeneralSectionProps) {
  const { settings, updateGeneral } = useSettings();
  const { siteName, description, language, timezone } = settings.general;

  return (
    <div className="rounded-[10px] border border-beige bg-white/70 p-6 backdrop-blur">
      <h2 className="font-display text-lg text-ink">عام</h2>
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TextField label="اسم الموقع" value={siteName} onChange={(v) => updateGeneral({ siteName: v })} />
        <div className="lg:col-span-2">
          <TextArea
            label="وصف الموقع"
            rows={3}
            value={description}
            onChange={(v) => updateGeneral({ description: v })}
          />
        </div>
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
      <button
        type="button"
        onClick={() => onSaved("تم حفظ الإعدادات العامة")}
        className="mt-6 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
      >
        حفظ التغييرات
      </button>
    </div>
  );
}

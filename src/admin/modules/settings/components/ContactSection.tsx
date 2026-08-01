import { useState } from "react";
import { TextField } from "@/admin/components/forms/TextField";
import { TextArea } from "@/admin/components/forms/TextArea";
import { useSettings } from "@/admin/context/SettingsContext";
import type { Language } from "@/context/LanguageContext";
import { SettingsRow } from "./SettingsRow";

interface ContactSectionProps {
  onSaved: (message: string) => void;
}

const EDITING_LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
];

export function ContactSection({ onSaved }: ContactSectionProps) {
  const { rawSettings, updateContact } = useSettings();
  const { email, phone, address, hours, instagram, pinterest, tiktok } = rawSettings.contact;
  const [editingLanguage, setEditingLanguage] = useState<Language>("ar");

  return (
    <div>
      <SettingsRow title="معلومات التواصل" description="تظهر هذه البيانات في صفحة تواصل معنا العامة.">
        <div className="mb-6 flex items-center gap-1 self-start rounded-full border border-beige p-1">
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
        <p className="mb-4 -mt-3 text-xs text-ink-faint">التبديل أعلاه يغيّر لغة تحرير «ساعات الرد» فقط.</p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            label="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={(v) => updateContact({ email: v })}
            dir="ltr"
          />
          <TextField
            label="رقم الهاتف"
            value={phone}
            onChange={(v) => updateContact({ phone: v })}
            placeholder="+966 5X XXX XXXX"
            dir="ltr"
          />
          <TextField
            label="ساعات الرد"
            value={hours[editingLanguage]}
            onChange={(v) => updateContact({ hours: { ...hours, [editingLanguage]: v } })}
          />
          <div className="sm:col-span-2">
            <TextArea
              label="العنوان"
              rows={2}
              value={address}
              onChange={(v) => updateContact({ address: v })}
              placeholder="اختياري"
            />
          </div>
        </div>
      </SettingsRow>

      <SettingsRow title="روابط التواصل الاجتماعي" description="تظهر في تذييل الموقع وصفحة التواصل.">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <TextField
            label="إنستغرام"
            value={instagram}
            onChange={(v) => updateContact({ instagram: v })}
            placeholder="https://instagram.com/…"
            dir="ltr"
          />
          <TextField
            label="بينتريست"
            value={pinterest}
            onChange={(v) => updateContact({ pinterest: v })}
            placeholder="https://pinterest.com/…"
            dir="ltr"
          />
          <TextField
            label="تيك توك"
            value={tiktok}
            onChange={(v) => updateContact({ tiktok: v })}
            placeholder="https://tiktok.com/@…"
            dir="ltr"
          />
        </div>
      </SettingsRow>

      <div className="pt-6">
        <button
          type="button"
          onClick={() => onSaved("تم حفظ إعدادات التواصل")}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
        >
          حفظ التغييرات
        </button>
      </div>
    </div>
  );
}

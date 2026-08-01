import { useState } from "react";
import { TextField } from "@/admin/components/forms/TextField";
import { TextArea } from "@/admin/components/forms/TextArea";
import { FileDropzone } from "@/admin/components/forms/FileDropzone";
import { MediaPickerModal } from "@/admin/modules/media/components/MediaPickerModal";
import { useSettings } from "@/admin/context/SettingsContext";
import type { Language } from "@/context/LanguageContext";
import { SettingsRow } from "./SettingsRow";

interface SeoSectionProps {
  onSaved: (message: string) => void;
}

const EDITING_LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
];

export function SeoSection({ onSaved }: SeoSectionProps) {
  const { rawSettings, updateSeo } = useSettings();
  const { title, description, socialImage } = rawSettings.seo;
  const [editingLanguage, setEditingLanguage] = useState<Language>("ar");
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div>
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

      <SettingsRow title="بيانات السيو" description="العنوان والوصف الافتراضيان الظاهران في نتائج البحث.">
        <div className="flex flex-col gap-6">
          <TextField
            label="عنوان الصفحة الرئيسية"
            value={title[editingLanguage]}
            onChange={(v) => updateSeo({ title: { ...title, [editingLanguage]: v } })}
          />
          <TextArea
            label="الوصف التعريفي (Meta Description)"
            rows={3}
            value={description[editingLanguage]}
            onChange={(v) => updateSeo({ description: { ...description, [editingLanguage]: v } })}
            maxLength={160}
          />
        </div>
      </SettingsRow>

      <SettingsRow title="المشاركة الاجتماعية" description="الصورة الظاهرة عند مشاركة الموقع — القياس المثالي 1200×630.">
        <div className="max-w-sm">
          <FileDropzone
            label="صورة المشاركة الاجتماعية"
            previewUrl={socialImage}
            onFileSelected={(file) => updateSeo({ socialImage: URL.createObjectURL(file) })}
            onClear={() => updateSeo({ socialImage: null })}
            onBrowseLibrary={() => setPickerOpen(true)}
          />
        </div>
      </SettingsRow>

      <div className="pt-6">
        <button
          type="button"
          onClick={() => onSaved("تم حفظ إعدادات السيو")}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
        >
          حفظ التغييرات
        </button>
      </div>

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => {
          updateSeo({ socialImage: asset.url });
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

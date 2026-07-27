import { useState } from "react";
import { TextField } from "../form/TextField";
import { TextArea } from "../form/TextArea";
import { FileDropzone } from "../form/FileDropzone";
import { MediaPickerModal } from "../media/MediaPickerModal";
import { useSettings } from "../../context/SettingsContext";
import { SettingsRow } from "./SettingsRow";

interface SeoSectionProps {
  onSaved: (message: string) => void;
}

export function SeoSection({ onSaved }: SeoSectionProps) {
  const { settings, updateSeo } = useSettings();
  const { title, description, socialImage } = settings.seo;
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div>
      <SettingsRow title="بيانات السيو" description="العنوان والوصف الافتراضيان الظاهران في نتائج البحث.">
        <div className="flex flex-col gap-6">
          <TextField label="عنوان الصفحة الرئيسية" value={title} onChange={(v) => updateSeo({ title: v })} />
          <TextArea
            label="الوصف التعريفي (Meta Description)"
            rows={3}
            value={description}
            onChange={(v) => updateSeo({ description: v })}
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

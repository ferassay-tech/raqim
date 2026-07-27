import { useState } from "react";
import { TextField } from "../form/TextField";
import { TextArea } from "../form/TextArea";
import { FileDropzone } from "../form/FileDropzone";
import { MediaPickerModal } from "../media/MediaPickerModal";
import { useSettings } from "../../context/SettingsContext";

interface SeoSectionProps {
  onSaved: (message: string) => void;
}

export function SeoSection({ onSaved }: SeoSectionProps) {
  const { settings, updateSeo } = useSettings();
  const { title, description, socialImage } = settings.seo;
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="rounded-[10px] border border-beige bg-white/70 p-6 backdrop-blur">
      <h2 className="font-display text-lg text-ink">السيو</h2>
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TextField label="عنوان الصفحة الرئيسية" value={title} onChange={(v) => updateSeo({ title: v })} />
        <div className="lg:col-span-2">
          <TextArea
            label="الوصف التعريفي (Meta Description)"
            rows={3}
            value={description}
            onChange={(v) => updateSeo({ description: v })}
            maxLength={160}
          />
        </div>
        <div className="max-w-sm">
          <FileDropzone
            label="صورة المشاركة الاجتماعية"
            hint="تظهر عند مشاركة الموقع في وسائل التواصل — القياس المثالي 1200×630"
            previewUrl={socialImage}
            onFileSelected={(file) => updateSeo({ socialImage: URL.createObjectURL(file) })}
            onClear={() => updateSeo({ socialImage: null })}
            onBrowseLibrary={() => setPickerOpen(true)}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => onSaved("تم حفظ إعدادات السيو")}
        className="mt-6 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
      >
        حفظ التغييرات
      </button>

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

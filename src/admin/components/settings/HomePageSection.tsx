import { useState } from "react";
import { FileDropzone } from "../form/FileDropzone";
import { MediaPickerModal } from "../media/MediaPickerModal";
import { useSettings } from "../../context/SettingsContext";
import { SettingsRow } from "./SettingsRow";

interface HomePageSectionProps {
  onSaved: (message: string) => void;
}

type PickerTarget = "heroImage" | "heroImageMobile" | null;

export function HomePageSection({ onSaved }: HomePageSectionProps) {
  const { settings, updateHomepage } = useSettings();
  const { heroImage, heroImageMobile } = settings.homepage;
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);

  return (
    <div>
      <SettingsRow
        title="صورة الواجهة الرئيسية"
        description="الصورة الكبيرة الظاهرة بجانب الكتاب المميز في الصفحة الرئيسية — أصل حقيقي من مكتبة الوسائط. عند تركها فارغة، تُستخدم صورة الكتاب المميز نفسها كما هو الحال اليوم."
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FileDropzone
            label="صورة الواجهة (سطح المكتب)"
            previewUrl={heroImage}
            onFileSelected={(file) => updateHomepage({ heroImage: URL.createObjectURL(file) })}
            onClear={() => updateHomepage({ heroImage: null })}
            onBrowseLibrary={() => setPickerTarget("heroImage")}
          />
          <FileDropzone
            label="صورة الواجهة (الجوال) — اختياري"
            hint="إن تُركت فارغة، تُستخدم صورة سطح المكتب على الجوال أيضًا."
            previewUrl={heroImageMobile}
            onFileSelected={(file) => updateHomepage({ heroImageMobile: URL.createObjectURL(file) })}
            onClear={() => updateHomepage({ heroImageMobile: null })}
            onBrowseLibrary={() => setPickerTarget("heroImageMobile")}
          />
        </div>
      </SettingsRow>

      <SettingsRow title="معاينة حية" description="مطابقة لتناسب القسم الفعلي في الصفحة الرئيسية — تتحدث فور تغيير الصورة أعلاه.">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <HeroPreviewCard label="سطح المكتب" src={heroImage} aspect="aspect-[16/10]" />
          <HeroPreviewCard label="الجوال" src={heroImageMobile ?? heroImage} aspect="aspect-[4/5]" />
        </div>
      </SettingsRow>

      <div className="pt-6">
        <button
          type="button"
          onClick={() => onSaved("تم حفظ إعدادات الصفحة الرئيسية")}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
        >
          حفظ التغييرات
        </button>
      </div>

      <MediaPickerModal
        open={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={(asset) => {
          if (pickerTarget === "heroImage") updateHomepage({ heroImage: asset.url });
          if (pickerTarget === "heroImageMobile") updateHomepage({ heroImageMobile: asset.url });
          setPickerTarget(null);
        }}
      />
    </div>
  );
}

function HeroPreviewCard({ label, src, aspect }: { label: string; src: string | null; aspect: string }) {
  return (
    <div>
      <p className="mb-2 text-xs text-ink-faint">{label}</p>
      <div className={`relative overflow-hidden rounded-[10px] border border-beige bg-gradient-to-br from-cream to-beige ${aspect}`}>
        {src ? (
          <img src={src} alt="" className="h-full w-full object-cover" style={{ objectPosition: "30% 35%" }} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-ink-faint">
            سيتم استخدام صورة الكتاب المميز
          </div>
        )}
      </div>
    </div>
  );
}

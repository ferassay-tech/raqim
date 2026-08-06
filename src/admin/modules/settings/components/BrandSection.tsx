import { useState } from "react";
import { FileDropzone } from "@/admin/components/forms/FileDropzone";
import { MediaPickerModal } from "@/admin/modules/media/components/MediaPickerModal";
import { CopyIconButton } from "@/admin/components/ui/CopyIconButton";
import { TextField } from "@/admin/components/forms/TextField";
import { Select } from "@/admin/components/forms/Select";
import { useSettings } from "@/admin/context/SettingsContext";
import { BRAND_FONT_OPTIONS } from "@/admin/types/settings";
import type { BrandColorTokens, BrandFontFamily, BrandFontRole, LogoSizing } from "@/admin/types/settings";
import { SettingsRow } from "./SettingsRow";

interface BrandSectionProps {
  onSaved: (message: string) => void;
  onError: (message: string) => void;
}

const COLOR_LABELS: Record<keyof BrandColorTokens, string> = {
  ivory: "عاجي",
  cream: "كريمي",
  beige: "بيج",
  gold: "ذهبي",
  goldDeep: "ذهبي غامق",
  lavender: "لافندر",
  mauve: "خزامي",
  ink: "حبري",
  inkSoft: "حبري فاتح",
  inkFaint: "حبري باهت",
};

const FONT_ROLE_LABELS: Record<BrandFontRole, string> = {
  display: "خط العناوين (Display)",
  body: "خط النصوص (Body)",
  logotype: "خط الشعار (Logotype)",
};

const FONT_OPTIONS = BRAND_FONT_OPTIONS.map((f) => ({ value: f, label: f }));

const OBJECT_FIT_OPTIONS: { value: LogoSizing["objectFit"]; label: string }[] = [
  { value: "contain", label: "احتواء كامل (Contain)" },
  { value: "cover", label: "تغطية (Cover)" },
  { value: "fill", label: "تمديد (Fill)" },
];

type PickerTarget = "logo" | "favicon" | "heroImage" | null;

export function BrandSection({ onSaved, onError }: BrandSectionProps) {
  const { settings, updateBrand: updateBrandRaw } = useSettings();
  const { logo, logoSizing, heroImage, wordmark, favicon, colors, fonts, radius, spacing, shadowSoft, shadowMd } =
    settings.brand;
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);

  const updateBrand: typeof updateBrandRaw = (values) =>
    updateBrandRaw(values).catch(() => {
      onError("تعذر حفظ إعدادات الهوية البصرية.");
    });

  const setColor = (token: keyof BrandColorTokens, hex: string) => {
    updateBrand({ colors: { ...colors, [token]: hex } });
  };
  const setFont = (role: BrandFontRole, family: BrandFontFamily) => {
    updateBrand({ fonts: { ...fonts, [role]: family } });
  };
  const setRadius = (key: keyof typeof radius, value: number) => {
    updateBrand({ radius: { ...radius, [key]: value } });
  };
  const setLogoSizing = <K extends keyof LogoSizing>(key: K, value: LogoSizing[K]) => {
    updateBrand({ logoSizing: { ...logoSizing, [key]: value } });
  };
  const setWordmark = <K extends keyof typeof wordmark>(key: K, value: (typeof wordmark)[K]) => {
    updateBrand({ wordmark: { ...wordmark, [key]: value } });
  };

  const optionalNumber = (v: string) => (v.trim() === "" ? null : Number(v) || 0);

  return (
    <div>
      <SettingsRow title="الشعار والأيقونة" description="تظهر هذه الصور في رأس الموقع، وعلامة تبويب المتصفح، ومشاركات التواصل.">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FileDropzone
            label="الشعار"
            previewUrl={logo}
            onFileSelected={(file) => updateBrand({ logo: URL.createObjectURL(file) })}
            onClear={() => updateBrand({ logo: null })}
            onBrowseLibrary={() => setPickerTarget("logo")}
          />
          <FileDropzone
            label="أيقونة الموقع (Favicon)"
            previewUrl={favicon}
            onFileSelected={(file) => updateBrand({ favicon: URL.createObjectURL(file) })}
            onClear={() => updateBrand({ favicon: null })}
            onBrowseLibrary={() => setPickerTarget("favicon")}
          />
        </div>
      </SettingsRow>

      <SettingsRow
        title="حجم الشعار"
        description="يتحكم في حجم الشعار الظاهر في رأس الموقع فقط. الأبعاد الصريحة (العرض/الارتفاع) تتجاوز حجمي الجوال وسطح المكتب عند تحديدها؛ نسبة العرض إلى الارتفاع محفوظة دائمًا."
      >
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <TextField
              label="العرض (px)"
              type="number"
              value={logoSizing.width === null ? "" : String(logoSizing.width)}
              onChange={(v) => setLogoSizing("width", optionalNumber(v))}
              hint="فارغ = تلقائي"
            />
            <TextField
              label="الارتفاع (px)"
              type="number"
              value={logoSizing.height === null ? "" : String(logoSizing.height)}
              onChange={(v) => setLogoSizing("height", optionalNumber(v))}
              hint="فارغ = حسب الحجم المتجاوب"
            />
            <TextField
              label="أقصى عرض (px)"
              type="number"
              value={logoSizing.maxWidth === null ? "" : String(logoSizing.maxWidth)}
              onChange={(v) => setLogoSizing("maxWidth", optionalNumber(v))}
              hint="فارغ = بلا حد"
            />
            <TextField
              label="أقصى ارتفاع (px)"
              type="number"
              value={logoSizing.maxHeight === null ? "" : String(logoSizing.maxHeight)}
              onChange={(v) => setLogoSizing("maxHeight", optionalNumber(v))}
              hint="فارغ = بلا حد"
            />
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <TextField
              label="حجم سطح المكتب (px)"
              type="number"
              value={String(logoSizing.desktopSize)}
              onChange={(v) => setLogoSizing("desktopSize", Number(v) || 0)}
            />
            <TextField
              label="حجم الجوال (px)"
              type="number"
              value={String(logoSizing.mobileSize)}
              onChange={(v) => setLogoSizing("mobileSize", Number(v) || 0)}
            />
            <Select
              label="طريقة العرض (Object Fit)"
              value={logoSizing.objectFit}
              onChange={(v) => setLogoSizing("objectFit", v as LogoSizing["objectFit"])}
              options={OBJECT_FIT_OPTIONS}
            />
            <TextField
              label="التباعد الداخلي (px)"
              type="number"
              value={String(logoSizing.padding)}
              onChange={(v) => setLogoSizing("padding", Number(v) || 0)}
            />
          </div>
        </div>
      </SettingsRow>

      <SettingsRow
        title="صورة الخلفية (Hero)"
        description="الخلفية الجوّية الظاهرة خلف عنوان صفحة الكتاب — أصل حقيقي من مكتبة الوسائط، قابل للاستبدال من هنا."
      >
        <div className="max-w-sm">
          <FileDropzone
            label="صورة الخلفية"
            previewUrl={heroImage}
            onFileSelected={(file) => updateBrand({ heroImage: URL.createObjectURL(file) })}
            onClear={() => updateBrand({ heroImage: null })}
            onBrowseLibrary={() => setPickerTarget("heroImage")}
          />
        </div>
      </SettingsRow>

      <SettingsRow
        title="طباعة الشعار النصي"
        description="خط ونمط كلمة «رقيم» الظاهرة بجانب الشعار في رأس الموقع — تُحدَّث فورًا عند التعديل."
      >
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Select
              label="الخط العربي"
              value={wordmark.arabicFontFamily}
              onChange={(v) => setWordmark("arabicFontFamily", v as BrandFontFamily)}
              options={FONT_OPTIONS}
            />
            <div>
              <Select
                label="الخط الإنجليزي"
                value={wordmark.englishFontFamily}
                onChange={(v) => setWordmark("englishFontFamily", v as BrandFontFamily)}
                options={FONT_OPTIONS}
              />
              <p className="mt-1.5 text-xs text-ink-faint">محجوز لنسخة إنجليزية مستقبلية من الشعار النصي.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <TextField
              label="سُمك الخط (Weight)"
              type="number"
              value={String(wordmark.fontWeight)}
              onChange={(v) => setWordmark("fontWeight", Number(v) || 400)}
              hint="مثال: 400"
            />
            <TextField
              label="تباعد الأحرف (em)"
              type="number"
              value={String(wordmark.letterSpacing)}
              onChange={(v) => setWordmark("letterSpacing", Number(v) || 0)}
            />
            <TextField
              label="حجم الخط لسطح المكتب (px)"
              type="number"
              value={String(wordmark.fontSizeDesktop)}
              onChange={(v) => setWordmark("fontSizeDesktop", Number(v) || 0)}
            />
            <TextField
              label="حجم الخط للجوال (px)"
              type="number"
              value={String(wordmark.fontSizeMobile)}
              onChange={(v) => setWordmark("fontSizeMobile", Number(v) || 0)}
            />
          </div>
        </div>
      </SettingsRow>

      <SettingsRow title="الألوان" description="تعديل أي لون هنا يُحدّث فورًا الألوان المستخدمة عبر كامل الموقع.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {(Object.keys(colors) as (keyof BrandColorTokens)[]).map((token) => (
            <div key={token} className="rounded-[10px] border border-beige p-3">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors[token]}
                  onChange={(e) => setColor(token, e.target.value)}
                  className="h-10 w-10 shrink-0 cursor-pointer rounded-md border border-beige bg-transparent p-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-ink">{COLOR_LABELS[token]}</p>
                  <input
                    type="text"
                    value={colors[token]}
                    onChange={(e) => setColor(token, e.target.value)}
                    dir="ltr"
                    className="w-full border-none bg-transparent p-0 text-[11px] text-ink-faint focus:outline-none"
                  />
                </div>
                <CopyIconButton value={colors[token]} label={`نسخ ${COLOR_LABELS[token]}`} className="h-6 w-6 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </SettingsRow>

      <SettingsRow title="الطباعة" description="أدوار الخطوط الثلاثة مقتصرة على الخطوط المُحمّلة فعليًا في الموقع.">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {(Object.keys(fonts) as BrandFontRole[]).map((role) => (
            <Select
              key={role}
              label={FONT_ROLE_LABELS[role]}
              value={fonts[role]}
              onChange={(v) => setFont(role, v as BrandFontFamily)}
              options={FONT_OPTIONS}
            />
          ))}
        </div>
      </SettingsRow>

      <SettingsRow title="الانحناء (Radius)" description="القيم بوحدة rem — تتحكم في استدارة الحواف عبر الموقع.">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <TextField label="أساسي" type="number" value={String(radius.base)} onChange={(v) => setRadius("base", Number(v) || 0)} />
          <TextField label="صغير" type="number" value={String(radius.sm)} onChange={(v) => setRadius("sm", Number(v) || 0)} />
          <TextField label="متوسط" type="number" value={String(radius.md)} onChange={(v) => setRadius("md", Number(v) || 0)} />
          <TextField label="كبير" type="number" value={String(radius.lg)} onChange={(v) => setRadius("lg", Number(v) || 0)} />
        </div>
      </SettingsRow>

      <SettingsRow title="التباعد (Spacing)" description="وحدة التباعد الأساسية التي يُشتق منها كل تباعد في الموقع تلقائيًا.">
        <div className="max-w-xs">
          <TextField
            label="وحدة التباعد الأساسية (rem)"
            type="number"
            value={String(spacing)}
            onChange={(v) => updateBrand({ spacing: Number(v) || 0 })}
          />
        </div>
      </SettingsRow>

      <SettingsRow title="الظلال (Admin فقط)" description="تُستخدم في بطاقات لوحة التحكم فقط، دون التأثير على تصميم الموقع العام.">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField label="ظل ناعم" value={shadowSoft} onChange={(v) => updateBrand({ shadowSoft: v })} dir="ltr" />
          <TextField label="ظل متوسط" value={shadowMd} onChange={(v) => updateBrand({ shadowMd: v })} dir="ltr" />
        </div>
      </SettingsRow>

      <div className="pt-6">
        <button
          type="button"
          onClick={() => onSaved("تم حفظ إعدادات الهوية البصرية")}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
        >
          حفظ التغييرات
        </button>
      </div>

      <MediaPickerModal
        open={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={(asset) => {
          if (pickerTarget === "logo") updateBrand({ logo: asset.url });
          if (pickerTarget === "favicon") updateBrand({ favicon: asset.url });
          if (pickerTarget === "heroImage") updateBrand({ heroImage: asset.url });
          setPickerTarget(null);
        }}
      />
    </div>
  );
}

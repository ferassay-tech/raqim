import { useState } from "react";
import { FileDropzone } from "../form/FileDropzone";
import { MediaPickerModal } from "../media/MediaPickerModal";
import { CopyIconButton } from "../CopyIconButton";
import { TextField } from "../form/TextField";
import { Select } from "../form/Select";
import { useSettings } from "../../context/SettingsContext";
import { BRAND_FONT_OPTIONS } from "../../types/settings";
import type { BrandColorTokens, BrandFontFamily, BrandFontRole } from "../../types/settings";

interface BrandSectionProps {
  onSaved: (message: string) => void;
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

export function BrandSection({ onSaved }: BrandSectionProps) {
  const { settings, updateBrand } = useSettings();
  const { logo, favicon, colors, fonts, radius, spacing, shadowSoft, shadowMd } = settings.brand;
  const [pickerTarget, setPickerTarget] = useState<"logo" | "favicon" | null>(null);

  const setColor = (token: keyof BrandColorTokens, hex: string) => {
    updateBrand({ colors: { ...colors, [token]: hex } });
  };
  const setFont = (role: BrandFontRole, family: BrandFontFamily) => {
    updateBrand({ fonts: { ...fonts, [role]: family } });
  };
  const setRadius = (key: keyof typeof radius, value: number) => {
    updateBrand({ radius: { ...radius, [key]: value } });
  };

  return (
    <div className="rounded-[10px] border border-beige bg-white/70 p-6 backdrop-blur">
      <h2 className="font-display text-lg text-ink">الهوية البصرية</h2>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="mt-6 border-t border-beige pt-6">
        <p className="text-sm text-ink">الألوان</p>
        <p className="mt-1 text-xs text-ink-faint">
          تعديل أي لون هنا يُحدّث فورًا الألوان المستخدمة عبر كامل الموقع.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
      </div>

      <div className="mt-6 border-t border-beige pt-6">
        <p className="text-sm text-ink">الطباعة</p>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
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
      </div>

      <div className="mt-6 border-t border-beige pt-6">
        <p className="text-sm text-ink">الانحناء (Radius)</p>
        <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-4">
          <TextField label="أساسي" type="number" value={String(radius.base)} onChange={(v) => setRadius("base", Number(v) || 0)} />
          <TextField label="صغير" type="number" value={String(radius.sm)} onChange={(v) => setRadius("sm", Number(v) || 0)} />
          <TextField label="متوسط" type="number" value={String(radius.md)} onChange={(v) => setRadius("md", Number(v) || 0)} />
          <TextField label="كبير" type="number" value={String(radius.lg)} onChange={(v) => setRadius("lg", Number(v) || 0)} />
        </div>
        <p className="mt-2 text-xs text-ink-faint">القيم بوحدة rem.</p>
      </div>

      <div className="mt-6 border-t border-beige pt-6">
        <p className="text-sm text-ink">التباعد (Spacing)</p>
        <div className="mt-4 max-w-xs">
          <TextField
            label="وحدة التباعد الأساسية (rem)"
            type="number"
            value={String(spacing)}
            onChange={(v) => updateBrand({ spacing: Number(v) || 0 })}
            hint="يُشتق منها كل تباعد في الموقع تلقائيًا"
          />
        </div>
      </div>

      <div className="mt-6 border-t border-beige pt-6">
        <p className="text-sm text-ink">الظلال (Admin فقط)</p>
        <p className="mt-1 text-xs text-ink-faint">
          تُستخدم في بطاقات لوحة التحكم فقط، دون التأثير على تصميم الموقع العام.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField label="ظل ناعم" value={shadowSoft} onChange={(v) => updateBrand({ shadowSoft: v })} dir="ltr" />
          <TextField label="ظل متوسط" value={shadowMd} onChange={(v) => updateBrand({ shadowMd: v })} dir="ltr" />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSaved("تم حفظ إعدادات الهوية البصرية")}
        className="mt-6 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
      >
        حفظ التغييرات
      </button>

      <MediaPickerModal
        open={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={(asset) => {
          if (pickerTarget === "logo") updateBrand({ logo: asset.url });
          if (pickerTarget === "favicon") updateBrand({ favicon: asset.url });
          setPickerTarget(null);
        }}
      />
    </div>
  );
}

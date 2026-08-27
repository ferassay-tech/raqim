import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import { Panel } from "@/admin/components/ui/Panel";
import { Select } from "@/admin/components/forms/Select";
import { Button } from "@/admin/components/ui/Button";
import { CopyIconButton } from "@/admin/components/ui/CopyIconButton";
import { IconAlertTriangle, IconCheck } from "@/admin/icons";
import { useSettings } from "@/admin/context/SettingsContext";
import { FONT_STACKS } from "@/admin/context/ThemeContext";
import { useBooks } from "@/admin/context/BooksContext";
import { isInLibraryGrid } from "@/admin/lib/bookPlacement";
import { INITIAL_SETTINGS } from "@/admin/data/settingsData";
import { BRAND_FONT_OPTIONS } from "@/admin/types/settings";
import type { BrandColorTokens, BrandFontFamily, BrandFontRole } from "@/admin/types/settings";

/**
 * Brand Control — real Dashboard control over the site's ACTUAL typography
 * and color tokens, not a preview-only showcase. Every control here reads
 * and writes the exact same `settings.brand` object the pre-existing Brand
 * tab (Settings → الهوية البصرية) already edits — same SettingsContext,
 * same Supabase-backed persistence, same ThemeSync mechanism that applies
 * these values as live CSS custom properties on the whole app (public site
 * included). This page does not introduce a second typography/color system;
 * it exposes the existing one with real content previews and a
 * responsibility map, and is scoped to Typography + Colors only — logo,
 * wordmark sizing, radius, spacing, and shadows remain the Brand tab's job.
 */

const FONT_ROLE_META: Record<BrandFontRole, { label: string; description: string }> = {
  display: {
    label: "خط العناوين (Display)",
    description: "العناوين الرئيسية والفرعية في كل الموقع (h1, h2, h3) وعناوين الكتب.",
  },
  body: {
    label: "خط النصوص (Body)",
    description: "النص الأساسي: الأوصاف، المقالات، الواجهة، والتنقل — الخط الافتراضي لأي نص بلا دور آخر.",
  },
  logotype: {
    label: "خط الشعار (Logotype)",
    description: "كلمة «رقيم» الظاهرة كشعار نصي بجانب الشعار في رأس الموقع، فقط.",
  },
  numeric: {
    label: "خط الأرقام (Numeric)",
    description: "القيم التي تُقارن في عمود: الأسعار، الإحصاءات، الكميات، وأرقام SKU.",
  },
};

const COLOR_META: Record<keyof BrandColorTokens, { label: string; description: string }> = {
  ivory: { label: "عاجي (Ivory)", description: "خلفية الصفحة الافتراضية عبر كامل الموقع." },
  cream: { label: "كريمي (Cream)", description: "خلفية البطاقات والعناصر المرتفعة قليلاً عن خلفية الصفحة." },
  beige: { label: "بيج (Beige)", description: "لون الحدود الافتراضي لكل عنصر تقريبًا في الموقع." },
  gold: { label: "ذهبي — Accent", description: "اللون المميز: الإجراءات الأساسية، الروابط، والتأكيد. يجب أن يبقى نادر الاستخدام." },
  goldDeep: { label: "ذهبي غامق — Interactive", description: "حالة التحويم/التفاعل على العناصر الذهبية والروابط." },
  lavender: { label: "لافندر", description: "لون تمييز زخرفي ثانوي." },
  mauve: { label: "خزامي", description: "لون تمييز زخرفي ثانوي آخر." },
  ink: { label: "حبري — Ink", description: "لون النص الأساسي عبر كامل الموقع." },
  inkSoft: { label: "حبري فاتح — Ink Soft", description: "نص ثانوي: أوصاف مساعدة وتفاصيل أقل أهمية." },
  inkFaint: { label: "حبري باهت — Ink Faint", description: "أفتح درجات النص: تلميحات، بيانات وصفية، نص شبه غائب." },
};

/** Documented, not inferred at runtime — this project has no script-coverage
 * check today (see the audit note in the implementation report). Facts
 * verified against each family's real glyph set. */
const FONT_SCRIPT_SUPPORT: Record<BrandFontFamily, { arabic: boolean; latin: boolean; note: string }> = {
  Amiri: { arabic: true, latin: true, note: "تغطية عربية كاملة (نسخ كلاسيكي)؛ تغطية لاتينية أساسية فقط." },
  "IBM Plex Sans Arabic": { arabic: true, latin: true, note: "عربية ولاتينية ضمن عائلة خطوط واحدة متجانسة." },
  "Cormorant Garamond": { arabic: false, latin: true, note: "خط لاتيني فقط — لا يحتوي على حروف عربية إطلاقًا." },
  "IBM Plex Mono": { arabic: false, latin: true, note: "خط لاتيني/رقمي فقط — للأرقام (٠-٩ اللاتينية) لا للنص العربي." },
  "Markazi Text": { arabic: true, latin: true, note: "خط عربي مصمم للقراءة الطويلة على الشاشات (بالتعاون مع جامعة Reading وGoogle)؛ يدعم اللاتينية أيضًا." },
  "Reem Kufi": { arabic: true, latin: true, note: "خط كوفي تاريخي (فاطمي) — للعناوين البارزة فقط، غير مناسب للنصوص الطويلة." },
  "Aref Ruqaa": { arabic: true, latin: true, note: "يحيي أسلوب خط الرقعة الكلاسيكي؛ تغطية لاتينية محدودة (مبنية على AMS Euler)." },
  Mada: { arabic: true, latin: true, note: "خط هندسي مستوحى من لافتات مترو القاهرة؛ تغطية لاتينية عبر Source Sans Pro." },
  "Readex Pro": { arabic: true, latin: true, note: "خط عربي/لاتيني معاصر بمحاور وزن مرنة — مناسب للواجهات والنصوص." },
  Rakkas: { arabic: true, latin: true, note: "خط عرض عربي جريء بطابع نسخي — للعناوين فقط، تغطية لاتينية محدودة." },
};

const FONT_OPTIONS = BRAND_FONT_OPTIONS.map((f) => ({ value: f, label: f }));

export default function BrandStudioPage() {
  const { settings, updateBrand } = useSettings();
  const { colors, fonts } = settings.brand;
  const { books } = useBooks();
  const [flash, setFlash] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  const previewBook = useMemo(
    () =>
      [...books]
        .filter((b) => b.deletedAt === null && isInLibraryGrid(b.placement))
        .sort((a, b) => a.displayOrder - b.displayOrder)[0],
    [books]
  );

  const notify = (message: string, variant: "success" | "error" = "success") => {
    setFlash({ message, variant });
    setTimeout(() => setFlash(null), variant === "success" ? 3000 : 5000);
  };

  const setFont = (role: BrandFontRole, family: BrandFontFamily) => {
    updateBrand({ fonts: { ...fonts, [role]: family } }).catch(() => notify("تعذر حفظ الخط.", "error"));
  };

  const setColor = (token: keyof BrandColorTokens, hex: string) => {
    updateBrand({ colors: { ...colors, [token]: hex } }).catch(() => notify("تعذر حفظ اللون.", "error"));
  };

  const handleReset = () => {
    updateBrand({ colors: INITIAL_SETTINGS.brand.colors, fonts: INITIAL_SETTINGS.brand.fonts })
      .then(() => notify("تمت الاستعادة إلى الإعدادات الافتراضية"))
      .catch(() => notify("تعذرت الاستعادة إلى الإعدادات الافتراضية.", "error"));
  };

  const rolesUsing = (family: BrandFontFamily): BrandFontRole[] =>
    (Object.keys(fonts) as BrandFontRole[]).filter((role) => fonts[role] === family);

  const priceLabel = previewBook?.prices.USD ? `$${previewBook.prices.USD.price.toFixed(2)}` : "$24.00";
  const bookTitle = previewBook?.title ?? "كوني هاجر";
  const bookAuthor = previewBook?.author ?? "مها نصر";

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader
        title="استوديو الهوية"
        description="تحكّم حقيقي في خطوط وألوان رقيم — أي تغيير هنا يُحدّث الموقع الفعلي فورًا، ويُحفظ تلقائيًا."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleReset}>استعادة الإعدادات الافتراضية</Button>
            <Button variant="primary" onClick={() => notify("تم حفظ إعدادات الهوية البصرية")}>حفظ التغييرات</Button>
          </div>
        }
      />

      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={
              flash.variant === "success"
                ? "flex items-center gap-2.5 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
                : "flex items-center gap-2.5 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
            }
          >
            {flash.variant === "success" ? <IconCheck className="h-4 w-4 shrink-0" /> : <IconAlertTriangle className="h-4 w-4 shrink-0" />}
            {flash.message}
          </motion.div>
        )}
      </AnimatePresence>

      <Panel title="خريطة المسؤولية" className="!bg-cream/40">
        <p className="mb-4 text-xs text-ink-faint">
          كل خط ولون هنا متصل فعليًا بالرمز المستخدم عبر الموقع بأكمله (Design Tokens) — تغييره هنا هو نفسه تغيير الموقع الحقيقي، وليس معاينة منفصلة.
        </p>
        <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
          {(Object.keys(FONT_ROLE_META) as BrandFontRole[]).map((role) => (
            <div key={role} className="flex items-baseline justify-between gap-3 border-b border-beige/60 py-1.5 text-xs">
              <span className="text-ink">{FONT_ROLE_META[role].label}</span>
              <span className="text-ink-faint" dir="ltr">{fonts[role]}</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* ---------------- Typography ---------------- */}
      <Panel title="الطباعة (Typography)">
        <p className="mb-5 text-xs text-ink-faint">
          الأدوار الأربعة أدناه هي أدوار الطباعة الفعلية المعرّفة في محرك التصميم (index.css) — لا يوجد دور منفصل للعربية عن
          اللاتينية اليوم: كل دور هو حزمة خط واحدة تُستخدم للغتين معًا. انظر «مكتبة الخطوط» أدناه لمعرفة أي الخطوط يدعم العربية فعليًا.
        </p>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {(Object.keys(FONT_ROLE_META) as BrandFontRole[]).map((role) => {
            const family = fonts[role];
            const support = FONT_SCRIPT_SUPPORT[family];
            const arabicRisk = !support.arabic && role !== "numeric";
            return (
              <div key={role} className="rounded-md border border-beige p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{FONT_ROLE_META[role].label}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">{FONT_ROLE_META[role].description}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Select label="الخط الحالي" value={family} onChange={(v) => setFont(role, v as BrandFontFamily)} options={FONT_OPTIONS} />
                </div>
                {arabicRisk && (
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-warning">
                    <IconAlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    هذا الخط لا يدعم الحروف العربية — سيعتمد المتصفح على خط احتياطي للنصوص العربية في هذا الدور.
                  </p>
                )}
                <div className="mt-4 rounded-md bg-cream/50 p-4">
                  {role === "numeric" ? (
                    <div className="flex items-baseline gap-4" style={{ fontFamily: FONT_STACKS[family] }}>
                      <span className="text-2xl text-ink" style={{ fontVariantNumeric: "tabular-nums" }}>1,204</span>
                      <span className="text-lg text-gold-deep" style={{ fontVariantNumeric: "tabular-nums" }}>{priceLabel}</span>
                    </div>
                  ) : role === "logotype" ? (
                    <span className="text-2xl text-ink" style={{ fontFamily: FONT_STACKS[family] }}>رقيم — Raqim</span>
                  ) : (
                    <div style={{ fontFamily: FONT_STACKS[family] }}>
                      <p className="text-xl text-ink" dir="rtl">{bookTitle}</p>
                      <p className="mt-1 text-sm text-ink-soft">A Legacy That Lasts</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* ---------------- Font Library ---------------- */}
      <Panel title="مكتبة الخطوط">
        <p className="mb-4 text-xs text-ink-faint">
          كل الخطوط المسجّلة فعليًا في الموقع (index.html) — لا يمكن اختيار خط غير موجود في هذه القائمة، ولا حاجة لتحميل أي خط جديد.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {BRAND_FONT_OPTIONS.map((family) => {
            const support = FONT_SCRIPT_SUPPORT[family];
            const usedIn = rolesUsing(family);
            return (
              <div key={family} className="rounded-md border border-beige p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-ink" dir="ltr">{family}</p>
                  <div className="flex gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${support.arabic ? "bg-success/10 text-success" : "bg-disabled/30 text-ink-faint"}`}>عربي</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${support.latin ? "bg-success/10 text-success" : "bg-disabled/30 text-ink-faint"}`}>Latin</span>
                  </div>
                </div>
                <p className="mt-2 text-2xl text-ink" style={{ fontFamily: FONT_STACKS[family] }} dir={support.arabic ? "rtl" : "ltr"}>
                  {support.arabic ? "رقيم" : "Raqim"}
                </p>
                <p className="mt-2 text-[11px] text-ink-faint">{support.note}</p>
                <p className="mt-2 text-[11px] text-ink-soft">
                  {usedIn.length > 0
                    ? `مستخدَم حاليًا في: ${usedIn.map((r) => FONT_ROLE_META[r].label).join("، ")}`
                    : "غير مستخدَم في أي دور حاليًا"}
                </p>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* ---------------- Colors ---------------- */}
      <Panel title="الألوان (Colors)">
        <p className="mb-4 text-xs text-ink-faint">
          كل الرموز اللونية أدناه متصلة مباشرة بمتغيرات CSS الفعلية المستخدمة عبر الموقع. ألوان الحالة (نجاح/تحذير/خطر) إشارات
          واجهة إدارية فقط وليست جزءًا من هوية العلامة، لذا غير معروضة هنا — بحسب التصميم القائم فعليًا في الكود.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(Object.keys(colors) as (keyof BrandColorTokens)[]).map((token) => (
            <div key={token} className="rounded-md border border-beige p-3">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colors[token]}
                  onChange={(e) => setColor(token, e.target.value)}
                  className="h-10 w-10 shrink-0 cursor-pointer rounded-md border border-beige bg-transparent p-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ink">{COLOR_META[token].label}</p>
                  <input
                    type="text"
                    value={colors[token]}
                    onChange={(e) => setColor(token, e.target.value)}
                    dir="ltr"
                    className="w-full border-none bg-transparent p-0 text-[11px] text-ink-faint focus:outline-none"
                  />
                </div>
                <CopyIconButton value={colors[token]} label={`نسخ ${COLOR_META[token].label}`} className="h-6 w-6 shrink-0" />
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">{COLOR_META[token].description}</p>
            </div>
          ))}
        </div>
      </Panel>

      {/* ---------------- Live Brand Preview ---------------- */}
      <Panel title="معاينة حيّة">
        <p className="mb-4 text-xs text-ink-faint">تستخدم نفس الرموز والخطوط المطبّقة فعليًا على الموقع — ما تراه هنا هو ما سيظهر للزوار.</p>
        <div
          className="rounded-md p-8"
          style={{ backgroundColor: colors.ivory, color: colors.ink, border: `1px solid ${colors.beige}` }}
        >
          <p className="text-3xl" style={{ fontFamily: FONT_STACKS[fonts.display], color: colors.ink }} dir="rtl">{bookTitle}</p>
          <p className="mt-1 text-lg italic" style={{ fontFamily: FONT_STACKS[fonts.display], color: colors.inkSoft }}>A Legacy That Lasts</p>

          <p className="mt-5 max-w-xl text-sm leading-relaxed" style={{ fontFamily: FONT_STACKS[fonts.body], color: colors.inkSoft }} dir="rtl">
            {settings.general.description}
          </p>

          <div className="mt-4 flex items-center gap-4 text-xs" style={{ fontFamily: FONT_STACKS[fonts.body], color: colors.inkFaint }}>
            <span>{bookAuthor}</span>
            <span>·</span>
            <span>٦ دقائق قراءة</span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-5">
            <span
              className="text-2xl"
              style={{ fontFamily: FONT_STACKS[fonts.numeric], color: colors.goldDeep, fontVariantNumeric: "tabular-nums" }}
            >
              {priceLabel}
            </span>
            <button
              type="button"
              className="rounded-full px-6 py-2.5 text-sm font-medium"
              style={{ fontFamily: FONT_STACKS[fonts.body], backgroundColor: colors.ink, color: colors.ivory }}
            >
              أضف إلى مكتبتي
            </button>
            <span
              className="rounded-full px-3 py-1 text-[11px]"
              style={{ fontFamily: FONT_STACKS[fonts.body], backgroundColor: `${colors.gold}22`, color: colors.goldDeep }}
            >
              الأكثر مبيعًا
            </span>
          </div>

          <div className="my-6 h-px w-full" style={{ backgroundColor: colors.beige }} />

          <div
            className="max-w-sm rounded-md p-5"
            style={{ backgroundColor: colors.cream, border: `1px solid ${colors.beige}` }}
          >
            <p className="text-lg" style={{ fontFamily: FONT_STACKS[fonts.display], color: colors.ink }} dir="rtl">{bookTitle}</p>
            <p className="mt-1 text-xs" style={{ fontFamily: FONT_STACKS[fonts.body], color: colors.inkFaint }}>{bookAuthor}</p>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="mt-3 inline-block text-xs underline"
              style={{ fontFamily: FONT_STACKS[fonts.body], color: colors.goldDeep }}
            >
              عرض جميع الكتب
            </a>
          </div>
        </div>
      </Panel>
    </div>
  );
}

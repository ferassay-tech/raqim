import { PageHeader } from "@/admin/components/ui/PageHeader";
import { getThemePreset } from "../services/themeRegistry";

/** Read-only view of the "default" token preset — real theme editing
 * (a draft/publish flow, like Templates) is later-milestone work. */
export default function CommunicationThemePage() {
  const tokens = getThemePreset("default");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الهوية والتصميم"
        description="الألوان والخطوط والتنسيقات المشتركة التي ترثها كل القوالب بدلًا من تكرارها."
      />
      {tokens && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-[10px] border border-beige bg-white/70 p-5">
            <p className="mb-3 text-sm font-medium text-ink">الألوان</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(tokens.colors).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className="h-6 w-6 rounded-full border border-beige"
                    style={{ backgroundColor: value }}
                  />
                  <span className="text-xs text-ink-faint">{key}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[10px] border border-beige bg-white/70 p-5">
            <p className="mb-3 text-sm font-medium text-ink">الطباعة</p>
            <p className="text-sm text-ink-soft">
              {tokens.typography.headingFont} / {tokens.typography.bodyFont} — {tokens.typography.baseFontSize}px
            </p>
          </div>
        </div>
      )}
      <span className="w-fit rounded-full bg-cream px-3 py-1 text-[11px] tracking-wide text-ink-faint">
        قيد الإنشاء — تحرير الهوية ونشر الإصدارات سيُبنى في مرحلة لاحقة
      </span>
    </div>
  );
}

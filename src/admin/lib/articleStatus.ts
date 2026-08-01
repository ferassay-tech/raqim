import type { ArticleStatus } from "../types/article";
import type { StatusBadgeVariant } from "../components/ui/StatusBadge";

export const ARTICLE_STATUS_META: Record<ArticleStatus, { label: string; variant: StatusBadgeVariant }> = {
  published: { label: "منشور", variant: "success" },
  scheduled: { label: "مجدول", variant: "info" },
  draft: { label: "مسودة", variant: "warning" },
};

export const ARTICLE_STATUS_OPTIONS: { value: ArticleStatus; label: string }[] = (
  Object.entries(ARTICLE_STATUS_META) as [ArticleStatus, { label: string; variant: StatusBadgeVariant }][]
).map(([value, meta]) => ({ value, label: meta.label }));

/** ~200 wpm, the same rough estimate Medium/Ghost use — derived from actual
 * content length rather than stored, so it can never drift out of sync with
 * an edit. */
export function estimateReadingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** readTime is stored as an editorial Arabic string like "٦ دقائق" (see
 * AdminArticleRaw). In Arabic mode it's shown exactly as authored — zero risk
 * of drift. In English mode it's re-rendered as "N min read" using the same
 * number, rather than translating the Arabic words directly. */
export function formatReadTime(readTime: string, language: "ar" | "en"): string {
  if (language === "ar") return readTime;
  const latinized = readTime.replace(/[٠-٩]/g, (digit) => String(ARABIC_INDIC_DIGITS.indexOf(digit)));
  const n = parseInt(latinized, 10);
  if (Number.isNaN(n)) return readTime;
  return `${n} min read`;
}

/** "٢٠٢٦/٠٦/١٢" — the original site's exact blog date format (Arabic-Indic
 * digits, slash-separated), derived from the stored ISO date. Defaults to
 * "ar" so admin call sites (which never pass a language) keep this exact
 * format; public blog pages pass the active language to get Latin digits
 * in English mode. */
export function formatArticleDate(iso: string | null, language: "ar" | "en" = "ar"): string {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const formatted = `${y}/${m}/${day}`;
  if (language === "en") return formatted;
  return formatted.replace(/[0-9]/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
}

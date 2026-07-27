import type { ArticleStatus } from "../types/article";
import type { StatusBadgeVariant } from "../components/StatusBadge";

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

/** "٢٠٢٦/٠٦/١٢" — the original site's exact blog date format (Arabic-Indic
 * digits, slash-separated), derived from the stored ISO date. */
export function formatArticleDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`.replace(/[0-9]/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
}

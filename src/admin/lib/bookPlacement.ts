import type { BookPlacement } from "../types/book";
import type { StatusBadgeVariant } from "../components/StatusBadge";

export const BOOK_PLACEMENT_META: Record<BookPlacement, { label: string; variant: StatusBadgeVariant }> = {
  hero: { label: "بطل الصفحة الرئيسية", variant: "success" },
  featured: { label: "الكتاب المميز", variant: "info" },
  library: { label: "المكتبة", variant: "neutral" },
  comingSoon: { label: "قريبًا", variant: "warning" },
  hidden: { label: "مخفي", variant: "neutral" },
};

export const BOOK_PLACEMENT_OPTIONS: { value: BookPlacement; label: string }[] = (
  Object.entries(BOOK_PLACEMENT_META) as [BookPlacement, { label: string; variant: StatusBadgeVariant }][]
).map(([value, meta]) => ({ value, label: meta.label }));

/** Books shown in the public library grid (homepage + BooksIndexPage):
 * matches the original site's real behavior, where every book — including
 * "coming soon" ones — appeared in the general catalog with a قريبًا badge.
 * Only `hidden` (a new Admin-only capability that didn't exist before) is
 * excluded from the general grid. */
export function isInLibraryGrid(placement: BookPlacement): boolean {
  return placement !== "hidden";
}

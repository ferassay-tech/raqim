import type { LocalizedText } from "./siteContent";

export interface AdminCategory {
  id: string;
  name: string;
  description: string;
}

/** Raw, bilingual storage shape — the Admin Category editor reads/writes
 * this directly. Public/display consumers use the resolved AdminCategory
 * shape above (via useCategories().categories), never this type.
 *
 * AdminBook.category stores a category's name as a fixed Arabic string
 * (see CategoriesContext for why it's a name, not an id). Any code matching,
 * counting, or filtering books by category MUST compare against
 * useCategories().getCategoryMatchName(id) — the stable raw Arabic value —
 * never against the resolved display name, which varies by active language
 * and would silently break that comparison the moment an English name is
 * filled in. */
export interface AdminCategoryRaw {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
}

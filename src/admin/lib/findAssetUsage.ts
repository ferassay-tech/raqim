import type { AdminBook } from "../types/book";
import type { AdminArticle } from "../types/article";
import type { AdminSettings } from "../types/settings";

export interface AssetUsageRef {
  label: string;
  to: string;
}

interface AssetUsageContext {
  books: AdminBook[];
  articles: AdminArticle[];
  settings: AdminSettings;
}

/** Every place a given media URL is currently referenced — Books, Articles,
 * and Settings assets (logo/favicon/OG image) — so the Media Library can
 * show "used in" before allowing a delete instead of silently breaking
 * whatever renders that image. */
export function findAssetUsage(url: string, { books, articles, settings }: AssetUsageContext): AssetUsageRef[] {
  const refs: AssetUsageRef[] = [];

  for (const book of books) {
    if (book.deletedAt !== null) continue;
    const editPath = `/admin/books/edit/${book.id}`;
    if (book.cover === url) refs.push({ label: `غلاف كتاب: ${book.title}`, to: editPath });
    if (book.backCoverImage === url) refs.push({ label: `الغلاف الخلفي: ${book.title}`, to: editPath });
    if (book.previewPages.includes(url)) refs.push({ label: `صفحة معاينة: ${book.title}`, to: editPath });
    if (book.gallery.includes(url)) refs.push({ label: `صورة في معرض: ${book.title}`, to: editPath });
  }

  for (const article of articles) {
    if (article.coverImage === url) {
      refs.push({ label: `صورة مقالة: ${article.title}`, to: `/admin/articles/edit/${article.id}` });
    }
  }

  if (settings.brand.logo === url) refs.push({ label: "شعار الموقع", to: "/admin/settings/brand" });
  if (settings.brand.favicon === url) refs.push({ label: "أيقونة الموقع (Favicon)", to: "/admin/settings/brand" });
  if (settings.brand.heroImage === url) refs.push({ label: "صورة الخلفية (Hero)", to: "/admin/settings/brand" });
  if (settings.seo.socialImage === url) refs.push({ label: "صورة المشاركة الاجتماعية (السيو)", to: "/admin/settings/seo" });

  return refs;
}

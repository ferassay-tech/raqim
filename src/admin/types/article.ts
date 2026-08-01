import type { LocalizedText } from "./siteContent";

export type ArticleStatus = "draft" | "published" | "scheduled";

export interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  author: string;
  /** Public blog category label (e.g. "الأمومة") — distinct from book categories. */
  category: string;
  /** Author-set reading-time label (e.g. "٦ دقائق") — editorial copy, not derived from word count. */
  readTime: string;
  status: ArticleStatus;
  /** Only meaningful when status === "scheduled". */
  scheduledFor: string | null;
  publishedAt: string | null;
  updatedAt: string;
  seoTitle: string;
  seoDescription: string;
}

// مها نصر is the one real author currently published on the site —
// kept as a single-item array rather than a hardcoded string so a second
// real author can be added later without changing this type's shape.
export const ARTICLE_AUTHORS = ["مها نصر"] as const;

/** Raw, bilingual storage shape — the Article Editor reads/writes this
 * directly. Public/display consumers use the resolved AdminArticle shape
 * above (via useArticles()), never this type.
 *
 * readTime stays a plain string (not localized) — it's a short editorial
 * estimate, not translatable prose, and the app already derives a real
 * language-independent reading-time number from content via
 * estimateReadingMinutes(). author/slug/id also stay plain: author is a
 * proper noun, slug/id are structural identifiers (slug generation always
 * keys off the Arabic title, same as before this migration). */
export interface AdminArticleRaw {
  id: string;
  title: LocalizedText;
  slug: string;
  excerpt: LocalizedText;
  content: LocalizedText;
  coverImage: string | null;
  author: string;
  category: LocalizedText;
  readTime: string;
  status: ArticleStatus;
  scheduledFor: string | null;
  publishedAt: string | null;
  updatedAt: string;
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
}

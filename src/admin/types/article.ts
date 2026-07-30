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

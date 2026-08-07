import type { AdminArticleRaw, ArticleStatus } from "../types/article";
import type { LocalizedText } from "../types/siteContent";
import { createCollectionAdapter } from "../services/data/index.ts";
import type { CollectionAdapter } from "../services/data/index.ts";

/**
 * CMS Phase 6F — repository for articles, mirroring booksRepository.ts's
 * shape exactly (bilingual jsonb fields map straight through, plain
 * columns for everything else). Not wired into ArticlesContext yet.
 */

export interface ArticleRow {
  id: string;
  title: LocalizedText;
  slug: string;
  excerpt: LocalizedText;
  content: LocalizedText;
  cover_image: string | null;
  author: string;
  category: LocalizedText;
  read_time: string;
  status: ArticleStatus;
  scheduled_for: string | null;
  published_at: string | null;
  seo_title: LocalizedText;
  seo_description: LocalizedText;
  updated_at?: string;
}

export function articleToSupabaseRow(article: AdminArticleRaw): ArticleRow {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    cover_image: article.coverImage,
    author: article.author,
    category: article.category,
    read_time: article.readTime,
    status: article.status,
    scheduled_for: article.scheduledFor,
    published_at: article.publishedAt,
    seo_title: article.seoTitle,
    seo_description: article.seoDescription,
  };
}

export function articleFromSupabaseRow(row: ArticleRow): AdminArticleRaw {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.cover_image,
    author: row.author,
    category: row.category,
    readTime: row.read_time,
    status: row.status,
    scheduledFor: row.scheduled_for,
    publishedAt: row.published_at,
    updatedAt: (row.updated_at ?? "").slice(0, 10),
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
  };
}

export const articlesRepository: CollectionAdapter<ArticleRow> = createCollectionAdapter<ArticleRow>(
  "supabase",
  "articles",
  []
);

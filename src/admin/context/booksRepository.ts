import type { AdminBookRaw } from "../types/book";
import type { BookChapterRaw, BookFaqItemRaw, BookFeatureRaw, BookReviewRaw } from "../types/book";
import type { LocalizedText } from "../types/siteContent";
import { createCollectionAdapter } from "../services/data/index.ts";
import type { CollectionAdapter } from "../services/data/index.ts";

/**
 * CMS Phase 6A — Books repository, step 2 of 4. Not wired into
 * BooksContext yet (see the plan's commit sequence) — this file exists so
 * the mapping layer and the repository instance can be reviewed and
 * exercised on their own, against the real `books` table, before anything
 * in the running app depends on them.
 *
 * The Supabase row shape (structural columns + one `content` jsonb
 * document) is deliberately different from AdminBookRaw's flat shape —
 * toSupabaseRow()/fromSupabaseRow() are the only place that difference is
 * allowed to exist. Every other file continues to work with AdminBookRaw
 * exactly as it always has.
 */

/** Everything AdminBookRaw carries that isn't already its own structural
 * column — read/written as one document, never queried by sub-field.
 * `category` (the raw Arabic name string, e.g. "الأمومة والإلهام
 * الإسلامي") lives here rather than being re-derived from `category_id` at
 * read time: BooksIndexPage/CategoriesContext.getCategoryMatchName match
 * books by this exact string today, and this phase's scope explicitly
 * keeps that comparison working without introducing any runtime
 * name-to-id (or id-to-name) lookup. `category_id` is a real, populated
 * column (see generate-books-seed.mjs) but is intentionally not read here —
 * it exists as queryable infrastructure for a future phase, not as this
 * phase's source of truth for display/filtering. */
interface BookContent {
  category: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  longDescription: LocalizedText;
  whoFor: LocalizedText[];
  features: BookFeatureRaw[];
  chapters: BookChapterRaw[];
  reviews: BookReviewRaw[];
  faq: BookFaqItemRaw[];
  ctaLabel: LocalizedText;
  badges: LocalizedText[];
  language: LocalizedText;
  format: LocalizedText;
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
}

export interface BookSupabaseRow {
  id: string;
  author: string;
  author_slug: string;
  author_bio: LocalizedText;
  category_id: string | null;
  placement: AdminBookRaw["placement"];
  display_order: number;
  status: AdminBookRaw["status"];
  prices: AdminBookRaw["prices"];
  stock: number;
  sku: string;
  pages: number;
  sales: number;
  accent_color: string | null;
  cover: string | null;
  back_cover_image: string | null;
  gallery: string[];
  preview_pages: string[];
  content: BookContent;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

/** AdminBookRaw -> Supabase row. `category_id` is intentionally left to
 * the caller (never computed here) — see generate-books-seed.mjs for the
 * one, offline place that value is ever resolved. */
export function toSupabaseRow(raw: AdminBookRaw, categoryId: string | null): BookSupabaseRow {
  return {
    id: raw.id,
    author: raw.author,
    author_slug: raw.authorSlug,
    author_bio: raw.authorBio,
    category_id: categoryId,
    placement: raw.placement,
    display_order: raw.displayOrder,
    status: raw.status,
    prices: raw.prices,
    stock: raw.stock,
    sku: raw.sku,
    pages: raw.pages,
    sales: raw.sales,
    accent_color: raw.accentColor,
    cover: raw.cover,
    back_cover_image: raw.backCoverImage,
    gallery: raw.gallery,
    preview_pages: raw.previewPages,
    content: {
      category: raw.category,
      title: raw.title,
      subtitle: raw.subtitle,
      description: raw.description,
      longDescription: raw.longDescription,
      whoFor: raw.whoFor,
      features: raw.features,
      chapters: raw.chapters,
      reviews: raw.reviews,
      faq: raw.faq,
      ctaLabel: raw.ctaLabel,
      badges: raw.badges,
      language: raw.language,
      format: raw.format,
      seoTitle: raw.seoTitle,
      seoDescription: raw.seoDescription,
    },
    deleted_at: raw.deletedAt,
    created_at: raw.updatedAt,
    updated_at: raw.updatedAt,
  };
}

/** Supabase row -> AdminBookRaw — the exact shape every existing consumer
 * (Book Editor, public pages) already expects, unchanged. */
export function fromSupabaseRow(row: BookSupabaseRow): AdminBookRaw {
  return {
    id: row.id,
    author: row.author,
    authorSlug: row.author_slug,
    authorBio: row.author_bio,
    category: row.content.category,
    title: row.content.title,
    subtitle: row.content.subtitle,
    cover: row.cover,
    backCoverImage: row.back_cover_image,
    previewPages: row.preview_pages,
    gallery: row.gallery,
    placement: row.placement,
    displayOrder: row.display_order,
    prices: row.prices,
    stock: row.stock,
    sku: row.sku,
    status: row.status,
    language: row.content.language,
    format: row.content.format,
    pages: row.pages,
    description: row.content.description,
    longDescription: row.content.longDescription,
    whoFor: row.content.whoFor,
    features: row.content.features,
    chapters: row.content.chapters,
    reviews: row.content.reviews,
    faq: row.content.faq,
    ctaLabel: row.content.ctaLabel,
    badges: row.content.badges,
    accentColor: row.accent_color,
    seoTitle: row.content.seoTitle,
    seoDescription: row.content.seoDescription,
    sales: row.sales,
    deletedAt: row.deleted_at,
    updatedAt: row.updated_at,
  };
}

/** The generic engine (Phase 1), instantiated against the `books` table —
 * same factory Categories already uses, same "supabase" backend string.
 * No new adapter code. Not consumed by anything yet. */
export const booksRepository: CollectionAdapter<BookSupabaseRow> = createCollectionAdapter<BookSupabaseRow>(
  "supabase",
  "books",
  []
);

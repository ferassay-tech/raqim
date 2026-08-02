import type { LocalizedText } from "./siteContent";

export type BookStatus = "published" | "draft" | "archived";

/**
 * Single, scalable placement value per book instead of independent
 * booleans (showInHero/showAsFeatured/...). `hero` and `featured` books
 * also appear in the general library grid — only `comingSoon` and `hidden`
 * are excluded from it. Adding a new placement kind later is one more
 * union member, not a new flag threaded through every page.
 */
export type BookPlacement = "hero" | "featured" | "library" | "comingSoon" | "hidden";

export type BookCurrency = "USD" | "EGP" | "ILS";

export interface BookPriceEntry {
  price: number;
  compareAtPrice: number | null;
}

export interface BookFeature {
  icon: string;
  title: string;
  body: string;
}

export interface BookChapter {
  number: string;
  title: string;
}

export interface BookReview {
  quote: string;
  name: string;
  role: string;
}

export interface BookFaqItem {
  question: string;
  answer: string;
}

export interface AdminBook {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  /** Links the book page's "About the author" section to /authors/:slug. */
  authorSlug: string;
  /** Short author bio shown specifically on this book's page — distinct from
   * the author's own full bio on their dedicated /authors page. */
  authorBio: string;
  category: string;

  // Cover & gallery
  cover: string | null;
  backCoverImage: string | null;
  /** Flip-through preview pages, in reading order (public product page only). */
  previewPages: string[];
  gallery: string[];

  // Placement & ordering (drives the public homepage/library/coming-soon pages)
  placement: BookPlacement;
  displayOrder: number;

  // Pricing — manual, independent per currency, no FX conversion
  prices: Partial<Record<BookCurrency, BookPriceEntry>>;
  stock: number;
  sku: string;
  status: BookStatus;

  language: string;
  format: string;
  pages: number;

  // Page content, organized to match the public BookPage's own sections
  description: string;
  longDescription: string;
  whoFor: string[];
  features: BookFeature[];
  chapters: BookChapter[];
  reviews: BookReview[];
  faq: BookFaqItem[];
  ctaLabel: string;
  badges: string[];
  accentColor: string | null;

  seoTitle: string;
  seoDescription: string;

  sales: number;
  /** Soft delete — excluded from the public site and default Admin views,
   * but restorable from the "المحذوفة" trash view. */
  deletedAt: string | null;
  updatedAt: string;
}

/** Raw, bilingual storage shape for a book's copy fields — the Admin Book
 * Editor reads/writes this directly, one language at a time. Public pages
 * and every other Admin module consume the resolved AdminBook shape above
 * (via useBooks()), never this type. Structural/non-copy fields (ids,
 * images, pricing, placement, author's own name/slug, and category) stay
 * plain — same shape as AdminBook — since the author's own name is a proper
 * noun (handled separately via localizeProperName) and category still
 * matches CategoriesContext by plain-string name, which is untouched this
 * phase. Reviewer names, book language, and book format ARE localized:
 * reviewer names are editorial testimonial copy (not real legal identities)
 * and language/format are genuinely user-facing labels, so all three get
 * real English text rather than staying frozen in Arabic. Chapter numbers
 * stay a plain digit string — purely an ordinal, reformatted per-language
 * at display time via formatNumeral() rather than translated. */
export interface BookFeatureRaw {
  icon: string;
  title: LocalizedText;
  body: LocalizedText;
}

export interface BookChapterRaw {
  number: string;
  title: LocalizedText;
}

export interface BookReviewRaw {
  quote: LocalizedText;
  name: LocalizedText;
  role: LocalizedText;
}

export interface BookFaqItemRaw {
  question: LocalizedText;
  answer: LocalizedText;
}

export interface AdminBookRaw {
  id: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  author: string;
  authorSlug: string;
  authorBio: LocalizedText;
  category: string;

  cover: string | null;
  backCoverImage: string | null;
  previewPages: string[];
  gallery: string[];

  placement: BookPlacement;
  displayOrder: number;

  prices: Partial<Record<BookCurrency, BookPriceEntry>>;
  stock: number;
  sku: string;
  status: BookStatus;

  language: LocalizedText;
  format: LocalizedText;
  pages: number;

  description: LocalizedText;
  longDescription: LocalizedText;
  whoFor: LocalizedText[];
  features: BookFeatureRaw[];
  chapters: BookChapterRaw[];
  reviews: BookReviewRaw[];
  faq: BookFaqItemRaw[];
  ctaLabel: LocalizedText;
  badges: LocalizedText[];
  accentColor: string | null;

  seoTitle: LocalizedText;
  seoDescription: LocalizedText;

  sales: number;
  deletedAt: string | null;
  updatedAt: string;
}

export const BOOK_CATEGORIES = [
  "الأمومة والإلهام الإسلامي",
  "التطوير الذاتي",
  "الروحانيات",
  "الأدب والسيرة",
  "تربية الأبناء",
] as const;

export const BOOK_STATUS_META: Record<BookStatus, string> = {
  published: "منشور",
  draft: "مسودة",
  archived: "مؤرشف",
};

export const CURRENCY_LABELS: Record<BookCurrency, string> = {
  USD: "دولار أمريكي ($)",
  EGP: "جنيه مصري (ج.م)",
  ILS: "شيكل (₪)",
};

export const CURRENCY_SYMBOLS: Record<BookCurrency, string> = {
  USD: "$",
  EGP: "ج.م",
  ILS: "₪",
};

/** Fixed icon set for book features — matches the public site's existing
 * ornament icon vocabulary (src/components/ornaments.tsx) exactly, so no
 * new icon is ever needed and the Admin only ever picks a key, never
 * uploads/designs an icon. */
export const BOOK_FEATURE_ICONS = [
  { value: "book", label: "كتاب" },
  { value: "quill", label: "قلم" },
  { value: "crescent", label: "هلال" },
  { value: "journal", label: "دفتر" },
  { value: "heart", label: "قلب" },
  { value: "openHands", label: "يدان مفتوحتان" },
  { value: "star", label: "نجمة" },
  { value: "leaf", label: "ورقة" },
] as const;

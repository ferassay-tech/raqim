/**
 * Central SEO constants — every page builds its canonical/OG/Twitter URLs
 * from here instead of hand-writing a literal URL itself.
 *
 * Uses the `www` host deliberately: the bare apex domain (r-aqim.com)
 * 308-redirects to www.r-aqim.com at the DNS/Vercel level (confirmed live,
 * SEO audit, 2026-08-14) — every canonical/OG/sitemap URL must point at the
 * host that actually resolves with 200, not one that redirects, or Google
 * treats the canonical target itself as a duplicate signal.
 */
export const SITE_URL = "https://www.r-aqim.com";
export const SITE_NAME = "رقيم";

/** The sitewide default social-share image and its real pixel dimensions —
 * only used as a fallback when a page doesn't supply its own image. */
export const DEFAULT_OG_IMAGE = "/og-image.webp";
export const DEFAULT_OG_IMAGE_WIDTH = 1730;
export const DEFAULT_OG_IMAGE_HEIGHT = 909;

/** Resolves any site-relative path to a full, absolute URL. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * SEO Milestone 2 — multilingual URL architecture. Arabic is unprefixed
 * (the canonical/default language, per every existing indexed URL);
 * English mirrors every public route under /en. Slugs are never
 * translated (book/author/blog identifiers are the same string in both
 * languages), so a route's /en prefix is the only difference between its
 * two language URLs — no per-route translation table is needed.
 */
export function stripLanguagePrefix(pathname: string): string {
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3);
  return pathname;
}

export function withLanguagePrefix(pathname: string, language: "ar" | "en"): string {
  const bare = stripLanguagePrefix(pathname);
  if (language === "ar") return bare;
  return bare === "/" ? "/en" : `/en${bare}`;
}

/**
 * Page-title/description resolution formulas — the single source of truth
 * for "what does this book/article/author page's SEO title actually say."
 * Extracted so BookPage.tsx/BlogPostPage.tsx/AuthorPage.tsx (client-side,
 * reading live Context data) and scripts/prerender-seo.mjs (build-time,
 * reading the same seed data) call the identical function instead of two
 * hand-copied formulas that could silently drift apart. Each takes already
 * language-resolved plain strings — same shape each page component already
 * has in hand at the call site.
 */
export function resolveBookSeoTitle(book: { seoTitle?: string; title: string }, fallbackSuffix: string): string {
  return book.seoTitle || `${book.title} — ${fallbackSuffix}`;
}

export function resolveBookSeoDescription(book: { seoDescription?: string; description: string }): string {
  return book.seoDescription || book.description;
}

export function resolveArticleSeoTitle(article: { seoTitle?: string; title: string }, suffix: string): string {
  return article.seoTitle || `${article.title}${suffix}`;
}

export function resolveArticleSeoDescription(article: { seoDescription?: string; excerpt: string }): string {
  return article.seoDescription || article.excerpt;
}

export function resolveAuthorSeoTitle(displayName: string, suffix: string): string {
  return `${displayName}${suffix}`;
}

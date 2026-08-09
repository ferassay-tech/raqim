/**
 * Central SEO constants — every page builds its canonical/OG/Twitter URLs
 * from here instead of hand-writing "https://r-aqim.com/..." itself.
 */
export const SITE_URL = "https://r-aqim.com";
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

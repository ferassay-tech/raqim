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

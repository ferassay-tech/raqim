/**
 * Single source of truth for every brand image path — the logo, the book
 * page's hero background, and the social-sharing (OG/Twitter) image all
 * come from here. Every one of these lives inside the project's own
 * `public/` assets (never an external URL), and every Settings seed /
 * Media Library entry / meta tag that needs one of these paths reads it
 * from this file instead of holding its own literal string.
 *
 * `index.html`'s og:image/twitter:image meta tags are the one necessary
 * exception — plain HTML can't import a TS module, since crawlers read it
 * before any JavaScript runs. Keep `OG_IMAGE` here in sync with those two
 * tags by hand if this path ever changes.
 */
export const BRAND_ASSETS = {
  logo: "/Raqim-logo.webp",
  heroImage: "/assets/arabesque-pattern.webp",
  ogImage: "/og-image.webp",
} as const;

/** The logo path that was the default before the RAQIM rebrand. A browser
 * that already persisted this exact value in Settings (before
 * `BRAND_ASSETS.logo` changed) would otherwise keep showing it forever —
 * persisted values always win over new defaults. `SettingsContext` uses
 * this to self-heal exactly that one known-stale value; any other logo an
 * admin has actually chosen is left untouched. */
export const LEGACY_LOGO_PATH = "/logos/lumora-logo-signature.png";

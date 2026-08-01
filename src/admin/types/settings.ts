import type { BookCurrency } from "./book";
import type { StorageProviderId } from "../services/storage";
import type { LocalizedText } from "./siteContent";

export interface GeneralSettings {
  siteName: string;
  description: string;
  language: "ar" | "en";
  timezone: string;
}

/** Every color token the public site's @theme actually defines (index.css) —
 * status colors (success/warning/danger) are Admin-only UI signals, not part
 * of the brand identity, so they're deliberately excluded here. */
export interface BrandColorTokens {
  ivory: string;
  cream: string;
  beige: string;
  gold: string;
  goldDeep: string;
  lavender: string;
  mauve: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
}

export type BrandFontRole = "display" | "body" | "logotype";

/** The only three font families actually loaded (index.html's Google Fonts
 * link) — an Admin picks which role each plays, never a new family, so no
 * new font ever needs loading. */
export const BRAND_FONT_OPTIONS = ["Amiri", "IBM Plex Sans Arabic", "Cormorant Garamond"] as const;
export type BrandFontFamily = (typeof BRAND_FONT_OPTIONS)[number];

export interface BrandRadiusTokens {
  base: number;
  sm: number;
  md: number;
  lg: number;
}

/** Header logo box — every value is optional/overridable except the two
 * responsive sizes, which is what actually renders day-to-day. Explicit
 * width/height (when set) take precedence over desktopSize/mobileSize;
 * objectFit guarantees the source image is never stretched out of its
 * aspect ratio regardless of which box it ends up in. */
export interface LogoSizing {
  width: number | null;
  height: number | null;
  maxWidth: number | null;
  maxHeight: number | null;
  desktopSize: number;
  mobileSize: number;
  objectFit: "contain" | "cover" | "fill";
  padding: number;
}

/** Typography for the "رقيم" wordmark shown beside the header logo —
 * distinct from `fonts.logotype` (used elsewhere across the site), so
 * editing the wordmark's own type never touches other logotype usages.
 * `englishFontFamily` is reserved for a future English wordmark variant —
 * only the Arabic text is actually rendered in the header today. */
export interface WordmarkTypography {
  arabicFontFamily: BrandFontFamily;
  englishFontFamily: BrandFontFamily;
  fontWeight: number;
  /** em units. */
  letterSpacing: number;
  fontSizeDesktop: number;
  fontSizeMobile: number;
}

export interface BrandSettings {
  logo: string | null;
  logoSizing: LogoSizing;
  /** The book page's atmospheric hero background — a real, replaceable
   * Media Library asset instead of a hardcoded path. */
  heroImage: string | null;
  wordmark: WordmarkTypography;
  favicon: string | null;
  colors: BrandColorTokens;
  fonts: Record<BrandFontRole, BrandFontFamily>;
  /** rem values — mirrors index.css's --radius/--radius-sm/--radius-md/--radius-lg. */
  radius: BrandRadiusTokens;
  /** rem value — Tailwind v4's single base spacing multiplier (index.css's --spacing). */
  spacing: number;
  /** Two additive Admin-only shadow tokens (Phase F) — the public site's own
   * bespoke per-component shadows are intentionally left untouched. */
  shadowSoft: string;
  shadowMd: string;
}

export interface SeoSettings {
  title: string;
  description: string;
  socialImage: string | null;
}

/** The homepage's "beside the featured book" showcase image — a real,
 * replaceable Media Library asset. `heroImage` is required for the section
 * to show a dashboard-controlled image at all; `heroImageMobile` is an
 * optional art-directed variant swapped in under the mobile breakpoint via
 * `<picture>`. When both are unset, HomePage falls back to the featured
 * book's own gallery image exactly as it did before this setting existed. */
export interface HomePageSettings {
  heroImage: string | null;
  heroImageMobile: string | null;
}

export interface ContactSettings {
  email: string;
  phone: string;
  address: string;
  hours: string;
  instagram: string;
  pinterest: string;
  tiktok: string;
}

export interface StoreSettings {
  supportedCurrencies: BookCurrency[];
  defaultCurrency: BookCurrency;
  tax: number;
  orderPrefix: string;
}

/** Which storage provider the Digital Library currently uploads through —
 * see src/admin/services/storage for the adapter interface itself. */
export interface StorageSettings {
  activeProvider: StorageProviderId;
  /** Days a newly generated/regenerated download link stays valid — null
   * means it never expires on its own. Applied at generation time only;
   * already-issued tokens keep whatever expiry they were given then. */
  downloadLinkExpiryDays: number | null;
  /** How many times a newly generated/regenerated download link may be used
   * before it stops working — null means unlimited. Same application
   * timing as `downloadLinkExpiryDays`. */
  downloadLinkMaxDownloads: number | null;
}

export interface AdminSettings {
  general: GeneralSettings;
  brand: BrandSettings;
  seo: SeoSettings;
  homepage: HomePageSettings;
  contact: ContactSettings;
  store: StoreSettings;
  storage: StorageSettings;
}

/** Raw, bilingual storage shape for the two genuinely reader-facing
 * SettingsContext strings — the default public SEO title/description
 * (rendered in HomePage's <Helmet>) and the contact page's response-hours
 * text. Everything else in Settings has zero public display consumer today
 * (GeneralSettings, StoreSettings) or is structural/non-prose (email, phone,
 * address, social URLs, brand design tokens, storage config) — converting
 * those would be unused surface area, not a real localization gap. */
export interface SeoSettingsRaw {
  title: LocalizedText;
  description: LocalizedText;
  socialImage: string | null;
}

export interface ContactSettingsRaw {
  email: string;
  phone: string;
  address: string;
  hours: LocalizedText;
  instagram: string;
  pinterest: string;
  tiktok: string;
}

export interface AdminSettingsRaw {
  general: GeneralSettings;
  brand: BrandSettings;
  seo: SeoSettingsRaw;
  homepage: HomePageSettings;
  contact: ContactSettingsRaw;
  store: StoreSettings;
  storage: StorageSettings;
}

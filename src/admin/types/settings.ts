import type { BookCurrency } from "./book";

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

export interface BrandSettings {
  logo: string | null;
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

export interface AdminSettings {
  general: GeneralSettings;
  brand: BrandSettings;
  seo: SeoSettings;
  contact: ContactSettings;
  store: StoreSettings;
}

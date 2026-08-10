import { useEffect } from "react";
import { useSettings } from "./SettingsContext";
import type { BrandColorTokens, BrandFontFamily } from "../types/settings";

/** Fallback stacks for the three fonts actually loaded (index.html) — an
 * Admin only ever reassigns which role a family plays, never introduces a
 * new one, so these stacks never need to change. Exported so any other
 * brand-typography consumer (e.g. the header wordmark) resolves a family
 * name to a real CSS font stack the same way, instead of duplicating it. */
export const FONT_STACKS: Record<BrandFontFamily, string> = {
  Amiri: '"Amiri", "Times New Roman", serif',
  "IBM Plex Sans Arabic": '"IBM Plex Sans Arabic", "Segoe UI", sans-serif',
  "Cormorant Garamond": '"Cormorant Garamond", serif',
  "IBM Plex Mono": '"IBM Plex Mono", ui-monospace, monospace',
  "Markazi Text": '"Markazi Text", serif',
  "Reem Kufi": '"Reem Kufi", sans-serif',
  "Aref Ruqaa": '"Aref Ruqaa", serif',
  Mada: '"Mada", sans-serif',
  "Readex Pro": '"Readex Pro", sans-serif',
  Rakkas: '"Rakkas", serif',
};

const COLOR_VARS: Record<keyof BrandColorTokens, string> = {
  ivory: "--color-ivory",
  cream: "--color-cream",
  beige: "--color-beige",
  gold: "--color-gold",
  goldDeep: "--color-gold-deep",
  lavender: "--color-lavender",
  mauve: "--color-mauve",
  ink: "--color-ink",
  inkSoft: "--color-ink-soft",
  inkFaint: "--color-ink-faint",
};

/**
 * Applies the persisted Brand Settings as live CSS custom-property
 * overrides on the document root — the mechanism that makes editing a
 * color/font/radius/spacing token in the Admin re-theme the public site
 * instantly, without a rebuild. Mounted once, high in the app tree
 * (AdminProviders), so it affects every page.
 */
export function ThemeSync() {
  const { settings } = useSettings();
  const { colors, fonts, radius, spacing, shadowSoft, shadowMd } = settings.brand;

  useEffect(() => {
    const root = document.documentElement.style;
    (Object.keys(colors) as (keyof BrandColorTokens)[]).forEach((key) => {
      root.setProperty(COLOR_VARS[key], colors[key]);
    });
  }, [colors]);

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--font-display", FONT_STACKS[fonts.display]);
    root.setProperty("--font-body", FONT_STACKS[fonts.body]);
    root.setProperty("--font-logotype", FONT_STACKS[fonts.logotype]);
    root.setProperty("--font-mono", FONT_STACKS[fonts.numeric]);
  }, [fonts]);

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--radius", `${radius.base}rem`);
    root.setProperty("--radius-sm", `${radius.sm}rem`);
    root.setProperty("--radius-md", `${radius.md}rem`);
    root.setProperty("--radius-lg", `${radius.lg}rem`);
    root.setProperty("--spacing", `${spacing}rem`);
  }, [radius, spacing]);

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--shadow-soft", shadowSoft);
    root.setProperty("--shadow-md", shadowMd);
  }, [shadowSoft, shadowMd]);

  useEffect(() => {
    let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    if (settings.brand.favicon) link.href = settings.brand.favicon;
  }, [settings.brand.favicon]);

  return null;
}

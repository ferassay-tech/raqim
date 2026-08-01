export type SocialPlatform = "instagram" | "tiktok" | "pinterest";

export interface SocialLink {
  /** A translation key (src/i18n/{ar,en}.json), not literal display text —
   * this file lives outside any component and can't call useLanguage()
   * itself, so the consumer (site-footer.tsx) resolves it via t(label). */
  label: string;
  /** null = not configured yet. Never fall back to "#" — the footer must
   * render a disabled control instead of a dead link when this is null. */
  url: string | null;
}

/**
 * Single source of truth for every social link shown on the public site.
 * Add a real URL here when the account exists — no component needs to
 * change; the footer (and anything else that reads this) renders a real
 * link the moment `url` stops being null.
 */
export const SOCIAL_LINKS: Record<SocialPlatform, SocialLink> = {
  instagram: { label: "footer.social.instagram", url: null },
  pinterest: { label: "footer.social.pinterest", url: null },
  tiktok: { label: "footer.social.tiktok", url: null },
};

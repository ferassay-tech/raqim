export type CardWeight = "focal" | "option" | "listing";

// Mirrors the three public card families already in use — a shared surface
// vocabulary, not a new visual default. Values are copied from the existing
// checkout/payment/listing surfaces verbatim; do not normalize them onto
// admin's --radius-*/--shadow-* tokens, which happen to be close but not
// equal (see Phase 2 / Item 1 investigation).
const CARD_SURFACE: Record<CardWeight, string> = {
  // The one decision-worthy surface on a checkout screen — persistent shadow.
  focal: "rounded-3xl border border-beige bg-white/70 p-6 shadow-[0_10px_40px_rgba(60,45,20,0.08)] backdrop-blur",
  // A choice among several (payment methods) — quieter than focal, still persistent.
  option: "rounded-2xl border border-beige bg-white/70 p-5 shadow-[0_6px_24px_rgba(60,45,20,0.06)] backdrop-blur",
  // Catalog browsing (books/articles) — calm at rest, shadow only on hover.
  listing: "rounded-md border border-beige transition-shadow duration-300 hover:shadow-[0_20px_45px_-20px_rgba(44,36,32,0.25)]",
};

export function cardSurface(weight: CardWeight, className = ""): string {
  return className ? `${CARD_SURFACE[weight]} ${className}` : CARD_SURFACE[weight];
}

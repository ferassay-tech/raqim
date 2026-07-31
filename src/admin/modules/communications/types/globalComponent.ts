/** Reusable Section/Block presets an editor can insert as an independent
 * copy or as a live-linked instance (edit once, updates everywhere it's
 * linked) — the mechanism, not yet the editor UI for it. */
export type GlobalComponentLevel = "section" | "block";

export type GlobalComponentCategory = "header" | "footer" | "cta" | "brandBanner" | "custom";

export interface GlobalComponent {
  id: string;
  name: string;
  level: GlobalComponentLevel;
  category: GlobalComponentCategory;
  settings: Record<string, unknown>;
  /** How many templates currently reference this component when linked
   * (not copied) — informational only at this stage. */
  usageCount: number;
}

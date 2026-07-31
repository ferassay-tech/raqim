/** A named slot a layout exposes for Sections to be placed into. */
export interface LayoutSlotDefinition {
  id: string;
  label: string;
  minSections?: number;
  maxSections?: number;
}

/** A registrable layout definition (services/layoutRegistry.ts) — the shape
 * a Template's `TemplateContent.layoutId` points at. */
export interface LayoutDefinition {
  id: string;
  label: string;
  slots: LayoutSlotDefinition[];
}

/**
 * The content hierarchy every template's editable body is built from:
 * Layout (named slot arrangement, see layout.ts) → Sections (composed
 * into each slot) → Blocks (atomic content units inside a section).
 * This is the one shape the future visual editor, the future renderer,
 * and every channel surface all read/write — no channel-specific content
 * shape is ever introduced beside it.
 */

/** Fixed, closed vocabulary — deliberately not an arbitrary expression
 * language, so a condition can always be safely evaluated and safely
 * rendered back into a builder UI. */
export type ConditionRule =
  | { type: "variableEquals"; variable: string; value: string }
  | { type: "variableExists"; variable: string }
  | { type: "language"; equals: string }
  | { type: "and"; rules: ConditionRule[] }
  | { type: "or"; rules: ConditionRule[] }
  | { type: "not"; rule: ConditionRule };

export type ContentVisibility = { mode: "always" } | { mode: "conditional"; rule: ConditionRule };

/** Every Section and every Block carries exactly this envelope — `type` is
 * a Block/Section Registry key (services/blockRegistry.ts), `settings` is
 * that registry entry's own shape (deliberately untyped here; each
 * renderer/editor narrows it). */
export interface ContentBlock {
  id: string;
  type: string;
  order: number;
  visibility: ContentVisibility;
  settings: Record<string, unknown>;
}

export interface ContentSection {
  id: string;
  type: string;
  order: number;
  visibility: ContentVisibility;
  settings: Record<string, unknown>;
  blocks: ContentBlock[];
}

/** A Layout's slot id (e.g. "header" | "main" | "footer") — defined per
 * layout in services/layoutRegistry.ts, not hardcoded here, so a new
 * layout can introduce new slots without touching this type. */
export type LayoutSlotId = string;

export interface TemplateContent {
  layoutId: string;
  slots: Record<LayoutSlotId, ContentSection[]>;
}

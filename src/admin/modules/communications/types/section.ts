import type { LocalizedText } from "../../../types/siteContent";

/**
 * A template's actual content — a flat, ordered list of Sections. No
 * nesting, no blocks-within-sections, no layout/slots, no conditional
 * visibility: this is deliberately simpler than the Layout/ContentSection/
 * ContentBlock shape in content.ts (Communication Foundation's speculative
 * future editor model, left untouched and currently unused). Adding real
 * visual/block editing later means introducing that complexity then, not
 * routing today's simple field-based content through it now.
 */
export type TemplateSectionType = "header" | "body" | "button" | "footer";

export interface HeaderSectionFields {
  title: string;
  subtitle: string;
}

/** "Rich text" here is a plain multi-line string edited in a textarea — no
 * WYSIWYG/HTML editor is introduced by this milestone. */
export interface BodySectionFields {
  richText: string;
}

export interface ButtonSectionFields {
  label: string;
  url: string;
}

export interface FooterSectionFields {
  text: string;
}

export type TemplateSection =
  | { id: string; type: "header"; order: number; fields: HeaderSectionFields }
  | { id: string; type: "body"; order: number; fields: BodySectionFields }
  | { id: string; type: "button"; order: number; fields: ButtonSectionFields }
  | { id: string; type: "footer"; order: number; fields: FooterSectionFields };

// --- Raw, bilingual storage shape ---------------------------------------
// The Template Editor's section form reads/writes these directly, one
// language at a time. Public/send-time consumers (TemplatePreviewModal,
// renderTemplateToHtml, OrderDownloadsCard) use the resolved TemplateSection
// shape above, never these types. `url` stays a plain string in every
// variant — it's a link, not prose.
export interface HeaderSectionFieldsRaw {
  title: LocalizedText;
  subtitle: LocalizedText;
}

export interface BodySectionFieldsRaw {
  richText: LocalizedText;
}

export interface ButtonSectionFieldsRaw {
  label: LocalizedText;
  url: string;
}

export interface FooterSectionFieldsRaw {
  text: LocalizedText;
}

export type TemplateSectionRaw =
  | { id: string; type: "header"; order: number; fields: HeaderSectionFieldsRaw }
  | { id: string; type: "body"; order: number; fields: BodySectionFieldsRaw }
  | { id: string; type: "button"; order: number; fields: ButtonSectionFieldsRaw }
  | { id: string; type: "footer"; order: number; fields: FooterSectionFieldsRaw };

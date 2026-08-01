import type { Language } from "../../context/LanguageContext";

export type SiteContentFieldType = "text" | "textarea";

/** One value per supported language. The Admin edits one language at a
 * time; the public site always resolves this to a single string. */
export type LocalizedText = Record<Language, string>;

export interface SiteContentField {
  id: string;
  /** Grouping label shown in the Admin's content page — e.g. "التنقّل". */
  section: string;
  label: string;
  type: SiteContentFieldType;
  value: LocalizedText;
}

/** Raw, bilingual storage shape — the Admin FAQ editor reads/writes this
 * directly. Public pages consume the resolved { question, answer } strings
 * returned by useSiteContent().faqs, not this type. */
export interface GlobalFaqItem {
  question: LocalizedText;
  answer: LocalizedText;
}

export type SiteContentFieldType = "text" | "textarea";

export interface SiteContentField {
  id: string;
  /** Grouping label shown in the Admin's content page — e.g. "التنقّل". */
  section: string;
  label: string;
  type: SiteContentFieldType;
  value: string;
}

export interface GlobalFaqItem {
  question: string;
  answer: string;
}

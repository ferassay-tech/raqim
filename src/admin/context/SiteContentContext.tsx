import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { GlobalFaqItem, SiteContentField } from "../types/siteContent";
import { INITIAL_GLOBAL_FAQS, INITIAL_SITE_CONTENT } from "../data/siteContentData";
import { usePersistedState } from "../lib/usePersistedState";

interface SiteContentContextValue {
  fields: SiteContentField[];
  getValue: (id: string) => string;
  updateField: (id: string, value: string) => void;
  faqs: GlobalFaqItem[];
  setFaqs: (faqs: GlobalFaqItem[]) => void;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

/**
 * Flat key/value registry for public-site copy that isn't book/article/
 * settings data — nav labels, footer copy, homepage section text, etc.
 * Adding a future editable string is one more seed entry (data/
 * siteContentData.ts), never a new component or context — the Admin's
 * /admin/content page renders whatever exists here, grouped by `section`.
 */
export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [fields, setFields] = usePersistedState<SiteContentField[]>("site_content", INITIAL_SITE_CONTENT);
  const [faqs, setFaqs] = usePersistedState<GlobalFaqItem[]>("global_faqs", INITIAL_GLOBAL_FAQS);

  const getValue = useCallback(
    (id: string) => fields.find((f) => f.id === id)?.value ?? "",
    [fields]
  );

  const updateField = useCallback((id: string, value: string) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, value } : f)));
  }, [setFields]);

  const value = useMemo(
    () => ({ fields, getValue, updateField, faqs, setFaqs }),
    [fields, getValue, updateField, faqs, setFaqs]
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error("useSiteContent must be used within SiteContentProvider");
  return ctx;
}

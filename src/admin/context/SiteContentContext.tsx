import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { GlobalFaqItem, LocalizedText, SiteContentField } from "../types/siteContent";
import { INITIAL_GLOBAL_FAQS, INITIAL_SITE_CONTENT } from "../data/siteContentData";
import { usePersistedState } from "../lib/usePersistedState";
import { useLanguage } from "../../context/LanguageContext";
import type { Language } from "../../context/LanguageContext";

interface ResolvedFaqItem {
  question: string;
  answer: string;
}

interface SiteContentContextValue {
  /** Raw, bilingual field list — Admin editor only. */
  fields: SiteContentField[];
  /** Resolved for the active site language (English falls back to Arabic). */
  getValue: (id: string) => string;
  updateField: (id: string, language: Language, value: string) => void;
  /** Resolved for the active site language — public consumers (FaqPage, BookPage). */
  faqs: ResolvedFaqItem[];
  /** Raw, bilingual FAQ list — Admin editor only. */
  rawFaqs: GlobalFaqItem[];
  setFaqs: (faqs: GlobalFaqItem[]) => void;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

const FALLBACK_LANGUAGE: Language = "ar";

function resolveText(value: LocalizedText, language: Language): string {
  return value[language] || value[FALLBACK_LANGUAGE] || "";
}

// Older localStorage records (and the original seed data) stored these
// fields as plain strings. Wrapping any plain string into
// { ar: value, en: "" } on read means existing users' content is never
// lost — this is a pure, idempotent transform, so already-migrated data
// just passes through unchanged and no separate one-time migration step or
// version flag is needed.
//
// `seedValue`, when given, self-heals a browser that already has this exact
// field stored from before an English translation was ever written for it:
// if the stored English is still empty AND the current seed now ships a
// real English value for this same field, adopt the seed's English text.
// Never touches Arabic, never overwrites an English value an admin actually
// typed (that's the "still empty" guard) — it only lets newly-authored
// translations reach browsers that already persisted the old, English-empty
// shape, without requiring anyone to clear storage.
function migrateLocalizedText(value: unknown, seedValue?: LocalizedText): LocalizedText {
  const migrated: LocalizedText =
    typeof value === "string"
      ? { ar: value, en: "" }
      : value && typeof value === "object"
        ? { ar: (value as Partial<LocalizedText>).ar ?? "", en: (value as Partial<LocalizedText>).en ?? "" }
        : { ar: "", en: "" };
  if (!migrated.en && seedValue?.en) {
    return { ...migrated, en: seedValue.en };
  }
  return migrated;
}

function migrateFields(fields: SiteContentField[]): SiteContentField[] {
  return fields.map((f) => {
    const seedField = INITIAL_SITE_CONTENT.find((s) => s.id === f.id);
    return { ...f, value: migrateLocalizedText(f.value, seedField?.value) };
  });
}

function migrateFaqs(faqs: GlobalFaqItem[]): GlobalFaqItem[] {
  return faqs.map((f, i) => {
    const seedFaq = INITIAL_GLOBAL_FAQS[i];
    return {
      question: migrateLocalizedText(f.question, seedFaq?.question),
      answer: migrateLocalizedText(f.answer, seedFaq?.answer),
    };
  });
}

/**
 * Flat key/value registry for public-site copy that isn't book/article/
 * settings data — nav labels, footer copy, homepage section text, etc.
 * Adding a future editable string is one more seed entry (data/
 * siteContentData.ts), never a new component or context — the Admin's
 * /admin/content page renders whatever exists here, grouped by `section`.
 *
 * Each value is bilingual ({ ar, en }); getValue()/faqs resolve to the
 * active site language for public consumers, falling back to Arabic when
 * English is empty.
 */
export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [rawFields, setFields] = usePersistedState<SiteContentField[]>("site_content", INITIAL_SITE_CONTENT);
  const [storedFaqs, setStoredFaqs] = usePersistedState<GlobalFaqItem[]>("global_faqs", INITIAL_GLOBAL_FAQS);
  const { language } = useLanguage();

  const fields = useMemo(() => migrateFields(rawFields), [rawFields]);
  const rawFaqs = useMemo(() => migrateFaqs(storedFaqs), [storedFaqs]);

  const getValue = useCallback(
    (id: string) => {
      const field = fields.find((f) => f.id === id);
      return field ? resolveText(field.value, language) : "";
    },
    [fields, language]
  );

  const updateField = useCallback(
    (id: string, fieldLanguage: Language, value: string) => {
      setFields((prev) =>
        migrateFields(prev).map((f) =>
          f.id === id ? { ...f, value: { ...f.value, [fieldLanguage]: value } } : f
        )
      );
    },
    [setFields]
  );

  const faqs = useMemo(
    () =>
      rawFaqs.map((f) => ({
        question: resolveText(f.question, language),
        answer: resolveText(f.answer, language),
      })),
    [rawFaqs, language]
  );

  const setFaqs = useCallback((next: GlobalFaqItem[]) => setStoredFaqs(next), [setStoredFaqs]);

  const value = useMemo(
    () => ({ fields, getValue, updateField, faqs, rawFaqs, setFaqs }),
    [fields, getValue, updateField, faqs, rawFaqs, setFaqs]
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error("useSiteContent must be used within SiteContentProvider");
  return ctx;
}

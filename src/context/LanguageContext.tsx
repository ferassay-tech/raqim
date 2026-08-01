import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import ar from "../i18n/ar.json";
import en from "../i18n/en.json";

export type Language = "ar" | "en";
export type TextDirection = "rtl" | "ltr";

const TRANSLATIONS: Record<Language, Record<string, string>> = { ar, en };

const STORAGE_KEY = "raqim_language";
const DEFAULT_LANGUAGE: Language = "ar";

function readStoredLanguage(): Language {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === "ar" || raw === "en" ? raw : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  dir: TextDirection;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Minimal i18n foundation for the public site only — Admin and
 * Communication are untouched and don't consume this. Persists to
 * localStorage under its own key ("raqim_language"), deliberately separate
 * from the admin "raqim_admin:" prefix and its usePersistedState hook, so
 * this stays fully self-contained from src/admin.
 *
 * Mutates document.documentElement's dir/lang directly — the one global
 * DOM attribute the public site's RTL/LTR styling relies on (index.html
 * only sets it once, at initial load). This is safe alongside Admin: every
 * Admin layout root already sets its own explicit dir="rtl" rather than
 * inheriting from <html>, so a public-site language switch can't visually
 * affect Admin even though both share one document.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);
  const dir: TextDirection = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore quota/availability errors — language still works in-memory */
    }
  }, []);

  const t = useCallback((key: string) => TRANSLATIONS[language][key] ?? key, [language]);

  const value = useMemo(() => ({ language, setLanguage, dir, t }), [language, setLanguage, dir, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

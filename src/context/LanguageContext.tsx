import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ar from "../i18n/ar.json";
import en from "../i18n/en.json";
import { stripLanguagePrefix, withLanguagePrefix } from "../lib/seo";

export type Language = "ar" | "en";
export type TextDirection = "rtl" | "ltr";

const TRANSLATIONS: Record<Language, Record<string, string>> = { ar, en };

const STORAGE_KEY = "raqim_language";

function persistLanguage(language: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    /* ignore quota/availability errors — language still works without it */
  }
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  dir: TextDirection;
  t: (key: string) => string;
  /** Rewrites a bare or already-prefixed site-relative path to the
   * *current* language's URL — use this for any internal `<Link to>` so
   * navigating doesn't silently drop the visitor back into the other
   * language (see SEO Milestone 2). */
  localizePath: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * SEO Milestone 2 — language is derived from the URL, not from stored
 * preference: a crawler, a direct navigation, and a page refresh must all
 * see the same language the URL itself says, with zero dependency on
 * localStorage. Arabic is unprefixed (the default); /en is the English
 * mirror of every public route (see App.tsx and lib/seo.ts).
 *
 * localStorage is still written on every manual switch, kept purely as a
 * remembered preference for possible future use — it is never read to
 * decide what the *current* page renders, so there is no circular
 * URL/localStorage synchronization to reason about: the URL always wins.
 *
 * Admin and Communication are untouched and don't consume this — every
 * Admin layout root already sets its own explicit dir="rtl" rather than
 * inheriting from <html>, and no /admin route is ever prefixed with /en,
 * so this always resolves to "ar" while under /admin, exactly as before.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const language: Language = location.pathname.startsWith("/en") ? "en" : "ar";
  const dir: TextDirection = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const setLanguage = useCallback(
    (next: Language) => {
      persistLanguage(next);
      if (next === language) return;
      const bare = stripLanguagePrefix(location.pathname);
      const nextPath = withLanguagePrefix(bare, next);
      navigate(`${nextPath}${location.search}${location.hash}`);
    },
    [language, location.pathname, location.search, location.hash, navigate]
  );

  const localizePath = useCallback((path: string) => withLanguagePrefix(path, language), [language]);

  const t = useCallback((key: string) => TRANSLATIONS[language][key] ?? key, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, dir, t, localizePath }),
    [language, setLanguage, dir, t, localizePath]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

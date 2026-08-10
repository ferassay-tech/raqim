import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type {
  AdminSettings,
  AdminSettingsRaw,
  BrandSettings,
  ContactSettingsRaw,
  GeneralSettings,
  HomePageSettings,
  SeoSettingsRaw,
  StorageSettings,
  StoreSettings,
} from "../types/settings";
import type { LocalizedText } from "../types/siteContent";
import { INITIAL_SETTINGS } from "../data/settingsData";
import { getSettings, updateSettings } from "./settingsRepository.ts";
import { BRAND_ASSETS, LEGACY_LOGO_PATH } from "../../config/brandAssets";
import { useLanguage } from "../../context/LanguageContext";
import type { Language } from "../../context/LanguageContext";

interface SettingsContextValue {
  /** Resolved for the active site language — public pages and the Admin's
   * own display consume this, unchanged shape. */
  settings: AdminSettings;
  /** Raw, bilingual — Settings editor only (Seo/Contact sections). */
  rawSettings: AdminSettingsRaw;
  updateGeneral: (values: Partial<GeneralSettings>) => Promise<void>;
  updateBrand: (values: Partial<BrandSettings>) => Promise<void>;
  updateSeo: (values: Partial<SeoSettingsRaw>) => Promise<void>;
  updateHomepage: (values: Partial<HomePageSettings>) => Promise<void>;
  updateContact: (values: Partial<ContactSettingsRaw>) => Promise<void>;
  updateStore: (values: Partial<StoreSettings>) => Promise<void>;
  updateStorage: (values: Partial<StorageSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const FALLBACK_LANGUAGE: Language = "ar";

function resolveText(value: LocalizedText, language: Language): string {
  return value[language] || value[FALLBACK_LANGUAGE] || "";
}

// Older records (and the original seed data) stored seo.title/.description
// and contact.hours as plain strings. Wrapping any plain string into
// { ar: value, en: "" } on read means existing settings are never lost —
// a pure, idempotent transform, so already-migrated data just passes
// through unchanged. Mirrors every other bilingual migration.
//
// `seedValue`, when given, self-heals a record that already persisted this
// exact field from before an English translation was written for it — see
// BooksContext.tsx's migrateLocalizedText for the full rationale.
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

/**
 * Single settings record, backed by the Supabase `site_settings` table
 * (one row, scope='default') since Phase 6E — read by both the Admin (7
 * section forms) and the public site (Brand tokens → ThemeSync, Contact →
 * ContactPage, Store currencies → checkout).
 *
 * Every updateXxx is Promise<void>-returning (not fire-and-forget) so a
 * caller can await and catch a real failure — most notably, writes are
 * owner-only at the database level (an existing, unchanged policy from
 * before this migration); an editor's save must surface as a visible
 * error, not disappear silently. See the 7 Settings section components
 * for the corresponding try/catch + Toast.
 *
 * seo.title/.description and contact.hours are stored bilingually;
 * `settings` resolves them to the active site language, falling back to
 * Arabic when English is empty — same contract as before this migration.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [storedSettings, setStoredSettings] = useState<AdminSettingsRaw>(INITIAL_SETTINGS);
  const { language } = useLanguage();

  useEffect(() => {
    let cancelled = false;
    getSettings()
      .then((data) => {
        if (cancelled) return;
        setStoredSettings(data);
      })
      .catch((error) => {
        console.error("Failed to load settings from Supabase:", error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Defensive merge against defaults — a record that persisted `settings`
  // before a new section or nested field (e.g. `storage`, or `brand`'s
  // `logoSizing`/`heroImage`/`wordmark`) existed would otherwise read back
  // an object missing those keys and crash the first time one is touched.
  // New fields should always land here, not assume a clean slate.
  const rawSettings: AdminSettingsRaw = useMemo(
    () => ({
      ...INITIAL_SETTINGS,
      ...storedSettings,
      brand: {
        ...INITIAL_SETTINGS.brand,
        ...storedSettings.brand,
        // Heal a record that persisted the pre-rebrand logo path before
        // `BRAND_ASSETS.logo` changed to `/Raqim-logo.webp` — otherwise that
        // stale value would keep winning over the new default forever. Any
        // other logo an admin has actually chosen is left exactly as-is.
        ...(storedSettings.brand?.logo === LEGACY_LOGO_PATH ? { logo: BRAND_ASSETS.logo } : {}),
        logoSizing: { ...INITIAL_SETTINGS.brand.logoSizing, ...storedSettings.brand?.logoSizing },
        wordmark: { ...INITIAL_SETTINGS.brand.wordmark, ...storedSettings.brand?.wordmark },
        // Same reasoning as logoSizing/wordmark above — a record persisted
        // before the `numeric` font role existed (Brand Studio milestone)
        // would otherwise read back a `fonts` object missing that key.
        fonts: { ...INITIAL_SETTINGS.brand.fonts, ...storedSettings.brand?.fonts },
      },
      seo: {
        ...INITIAL_SETTINGS.seo,
        ...storedSettings.seo,
        title: migrateLocalizedText(storedSettings.seo?.title, INITIAL_SETTINGS.seo.title),
        description: migrateLocalizedText(storedSettings.seo?.description, INITIAL_SETTINGS.seo.description),
      },
      contact: {
        ...INITIAL_SETTINGS.contact,
        ...storedSettings.contact,
        hours: migrateLocalizedText(storedSettings.contact?.hours, INITIAL_SETTINGS.contact.hours),
      },
      storage: { ...INITIAL_SETTINGS.storage, ...storedSettings.storage },
      homepage: { ...INITIAL_SETTINGS.homepage, ...storedSettings.homepage },
    }),
    [storedSettings]
  );

  const settings: AdminSettings = useMemo(
    () => ({
      ...rawSettings,
      seo: {
        ...rawSettings.seo,
        title: resolveText(rawSettings.seo.title, language),
        description: resolveText(rawSettings.seo.description, language),
      },
      contact: {
        ...rawSettings.contact,
        hours: resolveText(rawSettings.contact.hours, language),
      },
    }),
    [rawSettings, language]
  );

  const persist = useCallback(async (next: AdminSettingsRaw) => {
    try {
      await updateSettings(next);
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
    }
    setStoredSettings(next);
  }, []);

  const updateGeneral = useCallback(
    (values: Partial<GeneralSettings>) => persist({ ...storedSettings, general: { ...storedSettings.general, ...values } }),
    [storedSettings, persist]
  );

  const updateBrand = useCallback(
    (values: Partial<BrandSettings>) => persist({ ...storedSettings, brand: { ...storedSettings.brand, ...values } }),
    [storedSettings, persist]
  );

  const updateSeo = useCallback(
    (values: Partial<SeoSettingsRaw>) =>
      persist({
        ...storedSettings,
        seo: {
          ...storedSettings.seo,
          title: migrateLocalizedText(storedSettings.seo?.title),
          description: migrateLocalizedText(storedSettings.seo?.description),
          ...values,
        },
      }),
    [storedSettings, persist]
  );

  const updateHomepage = useCallback(
    (values: Partial<HomePageSettings>) =>
      persist({ ...storedSettings, homepage: { ...storedSettings.homepage, ...values } }),
    [storedSettings, persist]
  );

  const updateContact = useCallback(
    (values: Partial<ContactSettingsRaw>) =>
      persist({
        ...storedSettings,
        contact: {
          ...storedSettings.contact,
          hours: migrateLocalizedText(storedSettings.contact?.hours),
          ...values,
        },
      }),
    [storedSettings, persist]
  );

  const updateStore = useCallback(
    (values: Partial<StoreSettings>) => persist({ ...storedSettings, store: { ...storedSettings.store, ...values } }),
    [storedSettings, persist]
  );

  const updateStorage = useCallback(
    (values: Partial<StorageSettings>) =>
      persist({
        ...storedSettings,
        storage: { ...(storedSettings.storage ?? INITIAL_SETTINGS.storage), ...values },
      }),
    [storedSettings, persist]
  );

  const value = useMemo(
    () => ({
      settings,
      rawSettings,
      updateGeneral,
      updateBrand,
      updateSeo,
      updateHomepage,
      updateContact,
      updateStore,
      updateStorage,
    }),
    [
      settings,
      rawSettings,
      updateGeneral,
      updateBrand,
      updateSeo,
      updateHomepage,
      updateContact,
      updateStore,
      updateStorage,
    ]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

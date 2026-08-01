import { createContext, useCallback, useContext, useMemo } from "react";
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
import { usePersistedState } from "../lib/usePersistedState";
import { BRAND_ASSETS, LEGACY_LOGO_PATH } from "../../config/brandAssets";
import { useLanguage } from "../../context/LanguageContext";
import type { Language } from "../../context/LanguageContext";

interface SettingsContextValue {
  /** Resolved for the active site language — public pages and the Admin's
   * own display consume this, unchanged shape. */
  settings: AdminSettings;
  /** Raw, bilingual — Settings editor only (Seo/Contact sections). */
  rawSettings: AdminSettingsRaw;
  updateGeneral: (values: Partial<GeneralSettings>) => void;
  updateBrand: (values: Partial<BrandSettings>) => void;
  updateSeo: (values: Partial<SeoSettingsRaw>) => void;
  updateHomepage: (values: Partial<HomePageSettings>) => void;
  updateContact: (values: Partial<ContactSettingsRaw>) => void;
  updateStore: (values: Partial<StoreSettings>) => void;
  updateStorage: (values: Partial<StorageSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const FALLBACK_LANGUAGE: Language = "ar";

function resolveText(value: LocalizedText, language: Language): string {
  return value[language] || value[FALLBACK_LANGUAGE] || "";
}

// Older localStorage records (and the original seed data) stored seo.title/
// .description and contact.hours as plain strings. Wrapping any plain
// string into { ar: value, en: "" } on read means existing settings are
// never lost — a pure, idempotent transform, so already-migrated data just
// passes through unchanged. Mirrors every other bilingual migration.
//
// `seedValue`, when given, self-heals a browser that already persisted this
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
 * Single persisted settings record read by both the Admin (5 section forms)
 * and the public site (Brand tokens → ThemeSync, Contact → ContactPage,
 * Store currencies → checkout). Replaces the previous per-section local
 * `useState`, which reset on every reload and never reached the public site.
 *
 * seo.title/.description and contact.hours are stored bilingually; `settings`
 * resolves them to the active site language, falling back to Arabic when
 * English is empty — same contract as before this migration. Everything
 * else in Settings has no public display consumer today, or is structural/
 * non-prose, and was deliberately left untouched.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [storedSettings, setSettings] = usePersistedState<AdminSettingsRaw>("settings", INITIAL_SETTINGS);
  const { language } = useLanguage();

  // Defensive merge against defaults — a browser that persisted `settings`
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
        // Heal a browser that persisted the pre-rebrand logo path before
        // `BRAND_ASSETS.logo` changed to `/Raqim-logo.webp` — otherwise that
        // stale value would keep winning over the new default forever. Any
        // other logo an admin has actually chosen is left exactly as-is.
        ...(storedSettings.brand?.logo === LEGACY_LOGO_PATH ? { logo: BRAND_ASSETS.logo } : {}),
        logoSizing: { ...INITIAL_SETTINGS.brand.logoSizing, ...storedSettings.brand?.logoSizing },
        wordmark: { ...INITIAL_SETTINGS.brand.wordmark, ...storedSettings.brand?.wordmark },
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

  const updateGeneral = useCallback((values: Partial<GeneralSettings>) => {
    setSettings((prev) => ({ ...prev, general: { ...prev.general, ...values } }));
  }, [setSettings]);

  const updateBrand = useCallback((values: Partial<BrandSettings>) => {
    setSettings((prev) => ({ ...prev, brand: { ...prev.brand, ...values } }));
  }, [setSettings]);

  const updateSeo = useCallback(
    (values: Partial<SeoSettingsRaw>) => {
      setSettings((prev) => ({
        ...prev,
        seo: {
          ...prev.seo,
          title: migrateLocalizedText(prev.seo?.title),
          description: migrateLocalizedText(prev.seo?.description),
          ...values,
        },
      }));
    },
    [setSettings]
  );

  const updateHomepage = useCallback((values: Partial<HomePageSettings>) => {
    setSettings((prev) => ({ ...prev, homepage: { ...prev.homepage, ...values } }));
  }, [setSettings]);

  const updateContact = useCallback(
    (values: Partial<ContactSettingsRaw>) => {
      setSettings((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          hours: migrateLocalizedText(prev.contact?.hours),
          ...values,
        },
      }));
    },
    [setSettings]
  );

  const updateStore = useCallback((values: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, store: { ...prev.store, ...values } }));
  }, [setSettings]);

  const updateStorage = useCallback((values: Partial<StorageSettings>) => {
    setSettings((prev) => ({ ...prev, storage: { ...(prev.storage ?? INITIAL_SETTINGS.storage), ...values } }));
  }, [setSettings]);

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

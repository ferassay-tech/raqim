import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type {
  AdminSettings,
  BrandSettings,
  ContactSettings,
  GeneralSettings,
  HomePageSettings,
  SeoSettings,
  StorageSettings,
  StoreSettings,
} from "../types/settings";
import { INITIAL_SETTINGS } from "../data/settingsData";
import { usePersistedState } from "../lib/usePersistedState";
import { BRAND_ASSETS, LEGACY_LOGO_PATH } from "../../config/brandAssets";

interface SettingsContextValue {
  settings: AdminSettings;
  updateGeneral: (values: Partial<GeneralSettings>) => void;
  updateBrand: (values: Partial<BrandSettings>) => void;
  updateSeo: (values: Partial<SeoSettings>) => void;
  updateHomepage: (values: Partial<HomePageSettings>) => void;
  updateContact: (values: Partial<ContactSettings>) => void;
  updateStore: (values: Partial<StoreSettings>) => void;
  updateStorage: (values: Partial<StorageSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Single persisted settings record read by both the Admin (5 section forms)
 * and the public site (Brand tokens → ThemeSync, Contact → ContactPage,
 * Store currencies → checkout). Replaces the previous per-section local
 * `useState`, which reset on every reload and never reached the public site.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [rawSettings, setSettings] = usePersistedState<AdminSettings>("settings", INITIAL_SETTINGS);
  // Defensive merge against defaults — a browser that persisted `settings`
  // before a new section or nested field (e.g. `storage`, or `brand`'s
  // `logoSizing`/`heroImage`/`wordmark`) existed would otherwise read back
  // an object missing those keys and crash the first time one is touched.
  // New fields should always land here, not assume a clean slate.
  const settings: AdminSettings = useMemo(
    () => ({
      ...INITIAL_SETTINGS,
      ...rawSettings,
      brand: {
        ...INITIAL_SETTINGS.brand,
        ...rawSettings.brand,
        // Heal a browser that persisted the pre-rebrand logo path before
        // `BRAND_ASSETS.logo` changed to `/Raqim-logo.webp` — otherwise that
        // stale value would keep winning over the new default forever. Any
        // other logo an admin has actually chosen is left exactly as-is.
        ...(rawSettings.brand?.logo === LEGACY_LOGO_PATH ? { logo: BRAND_ASSETS.logo } : {}),
        logoSizing: { ...INITIAL_SETTINGS.brand.logoSizing, ...rawSettings.brand?.logoSizing },
        wordmark: { ...INITIAL_SETTINGS.brand.wordmark, ...rawSettings.brand?.wordmark },
      },
      storage: rawSettings.storage ?? INITIAL_SETTINGS.storage,
      homepage: { ...INITIAL_SETTINGS.homepage, ...rawSettings.homepage },
    }),
    [rawSettings]
  );

  const updateGeneral = useCallback((values: Partial<GeneralSettings>) => {
    setSettings((prev) => ({ ...prev, general: { ...prev.general, ...values } }));
  }, [setSettings]);

  const updateBrand = useCallback((values: Partial<BrandSettings>) => {
    setSettings((prev) => ({ ...prev, brand: { ...prev.brand, ...values } }));
  }, [setSettings]);

  const updateSeo = useCallback((values: Partial<SeoSettings>) => {
    setSettings((prev) => ({ ...prev, seo: { ...prev.seo, ...values } }));
  }, [setSettings]);

  const updateHomepage = useCallback((values: Partial<HomePageSettings>) => {
    setSettings((prev) => ({ ...prev, homepage: { ...prev.homepage, ...values } }));
  }, [setSettings]);

  const updateContact = useCallback((values: Partial<ContactSettings>) => {
    setSettings((prev) => ({ ...prev, contact: { ...prev.contact, ...values } }));
  }, [setSettings]);

  const updateStore = useCallback((values: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, store: { ...prev.store, ...values } }));
  }, [setSettings]);

  const updateStorage = useCallback((values: Partial<StorageSettings>) => {
    setSettings((prev) => ({ ...prev, storage: { ...(prev.storage ?? INITIAL_SETTINGS.storage), ...values } }));
  }, [setSettings]);

  const value = useMemo(
    () => ({
      settings,
      updateGeneral,
      updateBrand,
      updateSeo,
      updateHomepage,
      updateContact,
      updateStore,
      updateStorage,
    }),
    [settings, updateGeneral, updateBrand, updateSeo, updateHomepage, updateContact, updateStore, updateStorage]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type {
  AdminSettings,
  BrandSettings,
  ContactSettings,
  GeneralSettings,
  SeoSettings,
  StorageSettings,
  StoreSettings,
} from "../types/settings";
import { INITIAL_SETTINGS } from "../data/settingsData";
import { usePersistedState } from "../lib/usePersistedState";

interface SettingsContextValue {
  settings: AdminSettings;
  updateGeneral: (values: Partial<GeneralSettings>) => void;
  updateBrand: (values: Partial<BrandSettings>) => void;
  updateSeo: (values: Partial<SeoSettings>) => void;
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
  // before a new top-level section (e.g. `storage`) existed would otherwise
  // read back an object missing that key and crash the first time it's
  // touched. New sections should always land here, not assume a clean slate.
  const settings: AdminSettings = useMemo(
    () => ({ ...INITIAL_SETTINGS, ...rawSettings, storage: rawSettings.storage ?? INITIAL_SETTINGS.storage }),
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
    () => ({ settings, updateGeneral, updateBrand, updateSeo, updateContact, updateStore, updateStorage }),
    [settings, updateGeneral, updateBrand, updateSeo, updateContact, updateStore, updateStorage]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

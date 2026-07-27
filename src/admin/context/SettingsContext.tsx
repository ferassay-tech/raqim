import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type {
  AdminSettings,
  BrandSettings,
  ContactSettings,
  GeneralSettings,
  SeoSettings,
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
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Single persisted settings record read by both the Admin (5 section forms)
 * and the public site (Brand tokens → ThemeSync, Contact → ContactPage,
 * Store currencies → checkout). Replaces the previous per-section local
 * `useState`, which reset on every reload and never reached the public site.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = usePersistedState<AdminSettings>("settings", INITIAL_SETTINGS);

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

  const value = useMemo(
    () => ({ settings, updateGeneral, updateBrand, updateSeo, updateContact, updateStore }),
    [settings, updateGeneral, updateBrand, updateSeo, updateContact, updateStore]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

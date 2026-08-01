import type { FC, ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { BooksProvider } from "./BooksContext";
import { OrdersProvider } from "./OrdersContext";
import { CustomerNotesProvider } from "./CustomerNotesContext";
import { CategoriesProvider } from "./CategoriesContext";
import { CouponsProvider } from "./CouponsContext";
import { ArticlesProvider } from "./ArticlesContext";
import { MediaProvider } from "./MediaContext";
import { MessagesProvider } from "./MessagesContext";
import { CommunicationCategoriesProvider } from "./CommunicationCategoriesContext";
import { CommunicationTemplatesProvider } from "./CommunicationTemplatesContext";
import { SettingsProvider } from "./SettingsContext";
import { SiteContentProvider } from "./SiteContentContext";
import { LibraryProvider } from "./LibraryContext";
import { DownloadsProvider } from "./DownloadsContext";
import { ThemeSync } from "./ThemeContext";

const PROVIDERS: FC<{ children: ReactNode }>[] = [
  AuthProvider,
  SettingsProvider,
  SiteContentProvider,
  BooksProvider,
  OrdersProvider,
  CustomerNotesProvider,
  CategoriesProvider,
  CouponsProvider,
  ArticlesProvider,
  MediaProvider,
  MessagesProvider,
  CommunicationCategoriesProvider,
  CommunicationTemplatesProvider,
  // Both need SettingsProvider above them in this list (Library reads the
  // active storage provider; keeping them last is simplest, not required).
  LibraryProvider,
  DownloadsProvider,
];

/**
 * Composes every shared data store into one wrapper — mounted once at the
 * root of the whole app (see src/App.tsx), not just around /admin/*, so the
 * public site and the Admin read and write the exact same context
 * instances. That's what makes "single source of truth" real without a
 * backend: an edit in the Admin is visible on the public pages instantly
 * (same in-memory state) and survives a refresh (each store persists to
 * localStorage via usePersistedState). Order within the list below doesn't
 * matter — none of these depend on each other — just append new providers.
 * SiteContentProvider does depend on useLanguage(), though, so this whole
 * block must stay mounted inside LanguageProvider in App.tsx.
 */
export function AdminProviders({ children }: { children: ReactNode }) {
  return PROVIDERS.reduceRight<ReactNode>(
    (acc, Provider) => <Provider>{acc}</Provider>,
    <>
      <ThemeSync />
      {children}
    </>
  );
}

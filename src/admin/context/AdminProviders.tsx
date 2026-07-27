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
import { SettingsProvider } from "./SettingsContext";
import { SiteContentProvider } from "./SiteContentContext";
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
];

/**
 * Composes every shared data store into one wrapper — mounted once at the
 * root of the whole app (see src/App.tsx), not just around /admin/*, so the
 * public site and the Admin read and write the exact same context
 * instances. That's what makes "single source of truth" real without a
 * backend: an edit in the Admin is visible on the public pages instantly
 * (same in-memory state) and survives a refresh (each store persists to
 * localStorage via usePersistedState). Order doesn't matter today — none of
 * these depend on each other — just append new providers to the list above.
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

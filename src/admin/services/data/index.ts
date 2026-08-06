// CMS Foundation Phase 1 — the generic Data Layer engine. No existing
// module (Books, Articles, Settings, Media, Orders, ...) uses this yet;
// every current context keeps reading/writing localStorage directly via
// usePersistedState, unchanged. This exists so a future module migration
// is "instantiate this engine against a table name," not "invent a new
// adapter" — see the CMS Foundation master plan's Adapter Architecture.
export type { CollectionAdapter, SingletonAdapter, DataBackend } from "./types.ts";
export { createLocalCollectionAdapter, createLocalSingletonAdapter } from "./localAdapter.ts";
export { createSupabaseCollectionAdapter, createSupabaseSingletonAdapter } from "./supabaseAdapter.ts";

import type { CollectionAdapter, DataBackend, SingletonAdapter } from "./types.ts";
import { createLocalCollectionAdapter, createLocalSingletonAdapter } from "./localAdapter.ts";
import { createSupabaseCollectionAdapter, createSupabaseSingletonAdapter } from "./supabaseAdapter.ts";

export function createCollectionAdapter<T extends { id: string }>(
  backend: DataBackend,
  key: string,
  seed: T[]
): CollectionAdapter<T> {
  return backend === "supabase" ? createSupabaseCollectionAdapter<T>(key) : createLocalCollectionAdapter<T>(key, seed);
}

export interface CreateSingletonAdapterOptions<T> {
  backend: DataBackend;
  key: string;
  seed: T;
  /** Supabase only — the fixed row id the singleton lives at. Ignored for
   * the local backend, which addresses its one record by storage key alone. */
  supabaseRowId?: string;
}

export function createSingletonAdapter<T>(opts: CreateSingletonAdapterOptions<T>): SingletonAdapter<T> {
  return opts.backend === "supabase"
    ? createSupabaseSingletonAdapter<T>(opts.key, opts.supabaseRowId ?? "default")
    : createLocalSingletonAdapter<T>(opts.key, opts.seed);
}

export type HistoryBackend = "local" | "supabase";

export interface HistoryEntry<T> {
  id: string;
  entityType: string;
  entityId: string;
  data: T;
  version: number;
  updatedBy: string | null;
  createdAt: string;
}

/**
 * One shared, append-only history/versioning engine for every editorial
 * entity (Books, Articles, Settings, SiteContent, and later Design System
 * modules) — a single polymorphic log, not a bespoke history table per
 * entity. Deliberately narrow: recording and reading history is this
 * adapter's whole job; *restoring* a version (writing its `data` back
 * through the matching CollectionAdapter/SingletonAdapter) is a future
 * Admin workflow's job, orchestrating both, not this adapter's.
 */
export interface HistoryAdapter<T> {
  record(entityType: string, entityId: string, data: T, updatedBy: string | null): Promise<HistoryEntry<T>>;
  list(entityType: string, entityId: string): Promise<HistoryEntry<T>[]>;
  get(entryId: string): Promise<HistoryEntry<T> | null>;
}

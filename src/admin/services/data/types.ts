export type DataBackend = "local" | "supabase";

/**
 * Generic record store for a collection of entities (Books, Articles,
 * Categories, Orders, ...). `create` takes a *complete* row, id included —
 * id-generation policy varies per entity (slugify-from-title, order
 * numbering, etc.) and belongs to that entity's own thin wrapper once one
 * exists, not to this generic engine. No module constructs one of these
 * yet; see index.ts.
 */
export interface CollectionAdapter<T extends { id: string }> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | null>;
  create(row: T): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
}

/** Generic record store for a single, always-present record (Settings,
 * SiteContent's field list treated as one document, ...). */
export interface SingletonAdapter<T> {
  get(): Promise<T>;
  update(patch: Partial<T>): Promise<T>;
}

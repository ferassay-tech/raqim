import type { CollectionAdapter, SingletonAdapter } from "../data/types";
import { createTtlCache } from "./ttlCache";

/**
 * Wraps a CollectionAdapter's list()/get() behind a TTL cache, invalidated
 * on any write through the same wrapper — the shared caching primitive the
 * CMS Foundation master plan describes, so a future module's read path
 * opts into caching instead of hand-rolling its own. Not applied to any
 * real adapter instance anywhere in the app yet.
 */
export function withCachedCollection<T extends { id: string }>(
  adapter: CollectionAdapter<T>,
  ttlMs: number
): CollectionAdapter<T> {
  const listCache = createTtlCache(() => adapter.list(), { ttlMs });

  return {
    list: () => listCache.get(),

    async get(id) {
      const rows = await listCache.get();
      return rows.find((row) => row.id === id) ?? null;
    },

    async create(row) {
      const result = await adapter.create(row);
      listCache.invalidate();
      return result;
    },

    async update(id, patch) {
      const result = await adapter.update(id, patch);
      listCache.invalidate();
      return result;
    },

    async remove(id) {
      await adapter.remove(id);
      listCache.invalidate();
    },
  };
}

export function withCachedSingleton<T>(adapter: SingletonAdapter<T>, ttlMs: number): SingletonAdapter<T> {
  const cache = createTtlCache(() => adapter.get(), { ttlMs });

  return {
    get: () => cache.get(),

    async update(patch) {
      const result = await adapter.update(patch);
      cache.invalidate();
      return result;
    },
  };
}

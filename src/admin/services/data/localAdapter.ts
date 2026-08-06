import type { CollectionAdapter, SingletonAdapter } from "./types.ts";

// Matches usePersistedState.ts's own PREFIX exactly and on purpose: a
// future module migration (e.g. BooksContext adopting
// createLocalCollectionAdapter("books", INITIAL_BOOKS)) reads the exact
// same localStorage data that context already persisted by hand — an
// adapter swap, not a data migration. Implemented against `localStorage`
// directly rather than the usePersistedState *hook* because this engine
// has no React dependency: React contexts will wrap an adapter instance,
// not the other way around.
const PREFIX = "raqim_admin:";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignore quota/availability errors — same tolerance as usePersistedState */
  }
}

/**
 * A synchronous read of the same data `createLocalCollectionAdapter(...)
 * .list()` would eventually resolve with — for bootstrapping a React
 * component's initial state only (e.g. `useState(() => readLocalCollectionSnapshot(...))`).
 * The local backend is synchronous under the hood, but `CollectionAdapter`
 * is deliberately Promise-based throughout (the `supabase` backend can
 * never be synchronous) — without this escape hatch, a component's first
 * render would show `seed` instead of whatever was actually stored, until
 * an effect's async `.list()` resolves a moment later, which is a real,
 * visible flash-of-wrong-data regression that `usePersistedState`
 * (a plain synchronous `useState` initializer) never had. Local-only by
 * nature; there is no equivalent for the `supabase` backend.
 */
export function readLocalCollectionSnapshot<T>(storageKey: string, seed: T[]): T[] {
  return readJson(storageKey, seed);
}

export function createLocalCollectionAdapter<T extends { id: string }>(
  storageKey: string,
  seed: T[]
): CollectionAdapter<T> {
  return {
    async list() {
      return readJson(storageKey, seed);
    },

    async get(id) {
      const rows = readJson(storageKey, seed);
      return rows.find((row) => row.id === id) ?? null;
    },

    async create(row) {
      // Appends (insertion order) rather than prepending — the generic
      // engine has no per-caller "where should this go" option, and
      // append is the plain, unsurprising default for a stored collection.
      // A consumer wanting "newest first" (as Books' own hand-written
      // logic does today) re-sorts for display; it shouldn't change what
      // the store itself considers the canonical order.
      const rows = readJson(storageKey, seed);
      writeJson(storageKey, [...rows, row]);
      return row;
    },

    async update(id, patch) {
      const rows = readJson(storageKey, seed);
      let updated: T | undefined;
      const next = rows.map((row) => {
        if (row.id !== id) return row;
        updated = { ...row, ...patch };
        return updated;
      });
      if (!updated) throw new Error(`createLocalCollectionAdapter("${storageKey}"): no row with id "${id}"`);
      writeJson(storageKey, next);
      return updated;
    },

    async remove(id) {
      const rows = readJson(storageKey, seed);
      writeJson(
        storageKey,
        rows.filter((row) => row.id !== id)
      );
    },
  };
}

export function createLocalSingletonAdapter<T>(storageKey: string, seed: T): SingletonAdapter<T> {
  return {
    async get() {
      return readJson(storageKey, seed);
    },

    async update(patch) {
      const current = readJson(storageKey, seed);
      const next = { ...current, ...patch };
      writeJson(storageKey, next);
      return next;
    },
  };
}

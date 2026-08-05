import type { HistoryAdapter, HistoryEntry } from "./types";

const PREFIX = "raqim_admin:";
const STORAGE_KEY = PREFIX + "content_history";

function readAll<T>(): HistoryEntry<T>[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? [] : (JSON.parse(raw) as HistoryEntry<T>[]);
  } catch {
    return [];
  }
}

function writeAll<T>(entries: HistoryEntry<T>[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* ignore quota/availability errors */
  }
}

/**
 * One shared array holds every entity's history, filtered in memory by
 * (entityType, entityId) — mirrors the master plan's single polymorphic
 * `content_history` table rather than one table per entity. Not called
 * anywhere yet.
 */
export function createLocalHistoryAdapter<T>(): HistoryAdapter<T> {
  return {
    async record(entityType, entityId, data, updatedBy) {
      const all = readAll<T>();
      const priorVersions = all
        .filter((entry) => entry.entityType === entityType && entry.entityId === entityId)
        .map((entry) => entry.version);
      const version = priorVersions.length > 0 ? Math.max(...priorVersions) + 1 : 1;
      const entry: HistoryEntry<T> = {
        id: `${entityType}:${entityId}:${version}`,
        entityType,
        entityId,
        data,
        version,
        updatedBy,
        createdAt: new Date().toISOString(),
      };
      writeAll([...all, entry]);
      return entry;
    },

    async list(entityType, entityId) {
      return readAll<T>()
        .filter((entry) => entry.entityType === entityType && entry.entityId === entityId)
        .sort((a, b) => b.version - a.version);
    },

    async get(entryId) {
      return readAll<T>().find((entry) => entry.id === entryId) ?? null;
    },
  };
}

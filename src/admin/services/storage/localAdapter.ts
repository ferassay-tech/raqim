import type { StorageAdapter } from "./types";

/**
 * The only *working* adapter today — no backend exists yet to hold real
 * bytes anywhere. Mirrors exactly how MediaContext.addAssets already
 * mocks uploads: `URL.createObjectURL` gives a real, downloadable-today
 * blob URL, but it is scoped to this browser tab/session and does not
 * survive a reload (the file's *metadata* persists via usePersistedState
 * like every other Admin record; the bytes themselves do not — this is
 * the same honest limitation already documented on MediaContext, not a
 * new one). Swapping this out for `r2Adapter`/`s3Adapter`/`supabaseAdapter`
 * later is implementing the same three methods against a real SDK.
 */
export const localAdapter: StorageAdapter = {
  id: "local",
  label: "تخزين محلي (المتصفح)",

  async upload(file) {
    // Real providers use the caller-supplied `key` as the object path
    // (e.g. an R2/S3 key). Local storage has no such path — the object URL
    // itself is the only "location" that exists, so it doubles as the key.
    const url = URL.createObjectURL(file);
    return { storageKey: url, url };
  },

  async getDownloadUrl(storageKey) {
    // The local adapter's "storage key" already *is* a usable object URL —
    // a real adapter would instead exchange storageKey for a fresh,
    // time-limited presigned URL here.
    return storageKey;
  },

  async delete() {
    // Object URLs are released by the browser when their tab/session ends;
    // nothing to explicitly delete against local-only storage.
  },
};

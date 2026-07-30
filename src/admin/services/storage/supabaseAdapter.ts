import type { StorageAdapter } from "./types";
import { getSupabaseClient } from "../../../lib/supabaseClient";

const BUCKET = "library";

/** Applied only when the caller doesn't pass one (today, DownloadPage's
 * call site doesn't) — long enough for the fetch+blob roundtrip in
 * DownloadPage.tsx, short enough to keep the signed URL narrow. */
const DEFAULT_SIGNED_URL_TTL_SECONDS = 120;

/**
 * Real, persistent storage — replaces the local adapter's session-scoped
 * object URLs with actual bytes in a private Supabase Storage bucket
 * (`library`). Uses the anon key only (this app has no backend yet — see
 * roadmap Task 1.9); the bucket's own Storage RLS policies are what gate
 * upload/signed-URL access today, matching the same client-only trust model
 * already documented on DownloadsContext's token system. Real, stronger
 * security starts the day this moves behind a real auth/session check.
 */
export const supabaseAdapter: StorageAdapter = {
  id: "supabase",
  label: "Supabase Storage",

  async upload(file, key) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.storage.from(BUCKET).upload(key, file, { upsert: false });
    if (error) throw error;
    // `url` only ever gets consulted by LibraryContext when the active
    // provider is "local" (its own admin-preview convenience) — there's no
    // meaningful public URL for an object in a private bucket, so this
    // value is never actually read for Supabase; the storage path is the
    // closest honest thing to return.
    return { storageKey: data.path, url: data.path };
  },

  async getDownloadUrl(storageKey, opts) {
    const supabase = getSupabaseClient();
    const expiresIn = opts?.expiresInSeconds ?? DEFAULT_SIGNED_URL_TTL_SECONDS;
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storageKey, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  },

  async delete(storageKey) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.storage.from(BUCKET).remove([storageKey]);
    if (error) throw error;
  },
};

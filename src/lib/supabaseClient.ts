import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Lazily constructs the shared Supabase client on first real use rather than
 * at module load — importing this file (or the Supabase storage adapter
 * that uses it) never crashes the app just because VITE_SUPABASE_URL /
 * VITE_SUPABASE_ANON_KEY aren't set (e.g. Local storage is still the active
 * provider). Only actually trying to use Supabase Storage throws, with a
 * clear, actionable message — same "fail loudly and clearly instead of
 * silently" philosophy as the other not-yet-configured storage stubs.
 */
export function getSupabaseClient(): SupabaseClient {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example) before selecting Supabase Storage in Settings → Storage."
    );
  }
  client = createClient(url, anonKey);
  return client;
}

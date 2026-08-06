import type { AdminSettingsRaw } from "../types/settings";
import { getSupabaseClient } from "../../lib/supabaseClient.ts";

/**
 * CMS Phase 6E — repository for the single site_settings row. Not wired
 * into SettingsContext yet.
 *
 * site_settings is a singleton, but not the shape the generic engine's
 * createSupabaseSingletonAdapter assumes: that helper always addresses
 * the fixed row via `.eq("id", rowId)`, while this table's actual fixed
 * address is `scope = 'default'` (its `id` is a random uuid). Rather than
 * mint an arbitrary hardcoded uuid to satisfy that assumption, this talks
 * to the table directly - the same kind of small, deliberate divergence
 * ordersRepository.ts's insertOrder() already established when the
 * generic engine didn't fit a table's real shape.
 */

export async function getSettings(): Promise<AdminSettingsRaw> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("site_settings").select("data").eq("scope", "default").single();
  if (error) throw error;
  return data.data as AdminSettingsRaw;
}

export async function updateSettings(next: AdminSettingsRaw): Promise<void> {
  const supabase = getSupabaseClient();
  // .select() is required to detect a write RLS silently rejected: without
  // it, supabase-js sends Prefer: return=minimal, and PostgREST responds
  // 204 with an empty body whether 0 or 1 rows were actually affected —
  // `error` stays null either way, so a non-owner's blocked write would
  // otherwise look identical to success. site_settings_select_anon permits
  // anyone to read the row back, so this doesn't hit the same
  // RETURNING-requires-SELECT-policy issue insertOrder() worked around.
  const { data, error } = await supabase
    .from("site_settings")
    .update({ data: next })
    .eq("scope", "default")
    .select("scope");
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("Settings update affected no rows — check write permissions.");
  }
}

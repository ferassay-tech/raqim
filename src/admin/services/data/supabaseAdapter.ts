import { getSupabaseClient } from "../../../lib/supabaseClient";
import type { CollectionAdapter, SingletonAdapter } from "./types";

/**
 * Real Postgres-backed CRUD via the same anon-key client already used for
 * Supabase Storage — no table this points at exists yet (Phase 1
 * deliberately creates no schema; see the CMS Foundation master plan's
 * Database Design). This compiles and is ready the day a table does;
 * nothing calls it yet.
 */
export function createSupabaseCollectionAdapter<T extends { id: string }>(table: string): CollectionAdapter<T> {
  return {
    async list() {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from(table).select("*");
      if (error) throw error;
      return (data ?? []) as T[];
    },

    async get(id) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return (data as T | null) ?? null;
    },

    async create(row) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from(table).insert(row).select().single();
      if (error) throw error;
      return data as T;
    },

    async update(id, patch) {
      const supabase = getSupabaseClient();
      // Untyped (no generated Database schema), so supabase-js's own
      // update-payload generic can't line up with a generic `Partial<T>` —
      // widening to Record<string, unknown> here is a type-level escape
      // hatch, not a runtime behavior change.
      const { data, error } = await supabase
        .from(table)
        .update(patch as Record<string, unknown>)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as T;
    },

    async remove(id) {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
  };
}

/** `rowId` is the fixed primary key/scope the singleton always lives at
 * (e.g. Settings' single `scope = "default"` row) — this generic engine
 * doesn't assume what that scope column is called, only that one row,
 * addressable by `id`, always exists once seeded. */
export function createSupabaseSingletonAdapter<T>(table: string, rowId: string): SingletonAdapter<T> {
  return {
    async get() {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from(table).select("*").eq("id", rowId).single();
      if (error) throw error;
      return data as T;
    },

    async update(patch) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(table)
        .update(patch as Record<string, unknown>)
        .eq("id", rowId)
        .select()
        .single();
      if (error) throw error;
      return data as T;
    },
  };
}

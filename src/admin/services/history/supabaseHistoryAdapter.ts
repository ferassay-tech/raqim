import { getSupabaseClient } from "../../../lib/supabaseClient";
import type { HistoryAdapter, HistoryEntry } from "./types";

interface HistoryRow {
  id: string;
  entity_type: string;
  entity_id: string;
  data: unknown;
  version: number;
  updated_by: string | null;
  created_at: string;
}

function mapRow<T>(row: HistoryRow): HistoryEntry<T> {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    data: row.data as T,
    version: row.version,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
  };
}

/**
 * Talks to the shared `content_history` table the CMS Foundation master
 * plan proposes — that table does not exist yet (Phase 1 deliberately
 * creates no Supabase schema). `version` is intentionally left for the
 * database to assign (e.g. a trigger scoped per entity_type/entity_id)
 * rather than computed client-side, which could race under concurrent
 * writers. This compiles and is ready the day the table exists; nothing
 * calls it yet.
 */
export function createSupabaseHistoryAdapter<T>(table = "content_history"): HistoryAdapter<T> {
  return {
    async record(entityType, entityId, data, updatedBy) {
      const supabase = getSupabaseClient();
      const { data: row, error } = await supabase
        .from(table)
        .insert({ entity_type: entityType, entity_id: entityId, data, updated_by: updatedBy })
        .select()
        .single();
      if (error) throw error;
      return mapRow<T>(row as HistoryRow);
    },

    async list(entityType, entityId) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("version", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as HistoryRow[]).map((row) => mapRow<T>(row));
    },

    async get(entryId) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from(table).select("*").eq("id", entryId).maybeSingle();
      if (error) throw error;
      return data ? mapRow<T>(data as HistoryRow) : null;
    },
  };
}

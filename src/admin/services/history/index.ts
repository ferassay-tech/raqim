// CMS Foundation Phase 1 — history/versioning infrastructure, not
// activated. No module records or reads history yet; no `content_history`
// table exists. Ready for the Admin Workflow (draft/publish/rollback) a
// future phase adds to editorial modules (Books, Articles, Settings,
// SiteContent).
export type { HistoryAdapter, HistoryEntry, HistoryBackend } from "./types";
export { createLocalHistoryAdapter } from "./localHistoryAdapter";
export { createSupabaseHistoryAdapter } from "./supabaseHistoryAdapter";

import type { HistoryAdapter, HistoryBackend } from "./types";
import { createLocalHistoryAdapter } from "./localHistoryAdapter";
import { createSupabaseHistoryAdapter } from "./supabaseHistoryAdapter";

export function createHistoryAdapter<T>(backend: HistoryBackend): HistoryAdapter<T> {
  return backend === "supabase" ? createSupabaseHistoryAdapter<T>() : createLocalHistoryAdapter<T>();
}

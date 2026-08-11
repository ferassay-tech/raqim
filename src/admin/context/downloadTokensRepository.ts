import type { DownloadToken } from "../types/download";
import { createCollectionAdapter } from "../services/data/index.ts";
import type { CollectionAdapter } from "../services/data/index.ts";
import { getSupabaseClient } from "../../lib/supabaseClient.ts";

/**
 * P0-1 — repository for download_tokens (Supabase-backed, replacing the old
 * localStorage-only DownloadsContext). Row shape carries token_hash, never
 * the raw token — see the migration's own comment for why. The generic
 * CollectionAdapter engine (same one Orders/Library/Books already use)
 * covers admin-side list/create/update; resolving or recording a use by an
 * anonymous customer goes through the two SECURITY DEFINER RPCs below
 * instead, since RLS gives anon no direct table access at all.
 */

export interface DownloadTokenRow {
  id: string;
  order_id: string;
  token_hash: string;
  file_ids: string[];
  expires_at: string | null;
  max_downloads: number | null;
  download_count: number;
  disabled: boolean;
  last_downloaded_at: string | null;
  created_at: string;
}

export function tokenFromSupabaseRow(row: DownloadTokenRow): DownloadToken {
  return {
    id: row.id,
    orderId: row.order_id,
    fileIds: row.file_ids,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    maxDownloads: row.max_downloads,
    disabled: row.disabled,
    downloadCount: row.download_count,
    lastDownloadedAt: row.last_downloaded_at,
  };
}

export const downloadTokensRepository: CollectionAdapter<DownloadTokenRow> = createCollectionAdapter<DownloadTokenRow>(
  "supabase",
  "download_tokens",
  []
);

/** 256 bits of CSPRNG entropy (Web Crypto, not Math.random) — hex-encoded
 * so it's URL-safe with no escaping needed in /download/{rawToken}. */
export function generateRawToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** SHA-256, hex-encoded — must match the server's own
 * `encode(digest(p_token, 'sha256'), 'hex')` exactly (same algorithm, same
 * encoding) so a client-computed hash and the stored hash always agree. */
export async function hashToken(rawToken: string): Promise<string> {
  const data = new TextEncoder().encode(rawToken);
  const digestBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digestBuffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

export interface ResolvedDownloadToken {
  orderId: string;
  fileIds: string[];
}

/** Public, unauthenticated resolution — the only way a customer's browser
 * ever touches this table, via resolve_download_token() (SECURITY DEFINER).
 * Returns null for a missing/disabled/expired/exhausted token; the caller
 * doesn't need to distinguish which, matching the existing DownloadPage.tsx
 * behavior of treating every failure case as one "invalid link" state. */
export async function resolveDownloadToken(rawToken: string): Promise<ResolvedDownloadToken | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("resolve_download_token", { p_token: rawToken });
  if (error) throw error;
  const row = (data as { order_id: string; file_ids: string[] }[] | null)?.[0];
  if (!row) return null;
  return { orderId: row.order_id, fileIds: row.file_ids };
}

/** Records one completed file download via record_download_token_use()
 * (SECURITY DEFINER) — called only after a real fetch succeeds, mirroring
 * the previous client-only recordDownload's timing exactly. */
export async function recordDownloadTokenUse(rawToken: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc("record_download_token_use", { p_token: rawToken });
  if (error) throw error;
}

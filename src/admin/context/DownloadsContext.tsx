import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { DownloadToken, MintedDownloadToken } from "../types/download";
import {
  downloadTokensRepository,
  generateRawToken,
  hashToken,
  recordDownloadTokenUse,
  resolveDownloadToken,
  tokenFromSupabaseRow,
} from "./downloadTokensRepository.ts";
import type { DownloadTokenRow, ResolvedDownloadToken } from "./downloadTokensRepository.ts";
import { useSettings } from "./SettingsContext";
import { useAuth } from "./AuthContext";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Applies Settings → Storage's download-link policy at the moment a token
 * is (re)generated — already-issued tokens are never retroactively changed
 * if the policy is edited later. `null` in either setting means "no limit". */
function computeExpiresAt(expiryDays: number | null): string | null {
  return expiryDays === null ? null : new Date(Date.now() + expiryDays * DAY_MS).toISOString();
}

interface DownloadsContextValue {
  /** Admin-only — fetched once a real session exists (see below). Empty for
   * a public visitor; DownloadPage never reads this list, it calls
   * resolveToken directly. */
  tokens: DownloadToken[];
  getTokensForOrder: (orderId: string) => DownloadToken[];
  generateToken: (orderId: string, fileIds: string[]) => Promise<MintedDownloadToken>;
  regenerateToken: (orderId: string) => Promise<MintedDownloadToken | null>;
  disableToken: (tokenId: string) => Promise<void>;
  /** Public — records one completed file download by raw token. */
  recordDownload: (rawToken: string) => Promise<void>;
  /** Public — the one thing DownloadPage relies on. Resolves entirely
   * server-side (resolve_download_token), so it works from any browser,
   * not just the one that generated the token. */
  resolveToken: (rawToken: string) => Promise<ResolvedDownloadToken | null>;
}

const DownloadsContext = createContext<DownloadsContextValue | null>(null);

/**
 * P0-1 — Supabase-backed download tokens, replacing the old
 * localStorage-only implementation (usePersistedState). That version could
 * never work for a real customer: a token minted in the admin's own browser
 * only ever existed in that browser's localStorage, so the emailed
 * /download/{token} link would fail to resolve on the customer's own
 * device. See the migration (20260810120001) and downloadTokensRepository.ts
 * for the full security model — only a hash of the token is ever stored,
 * and only two SECURITY DEFINER functions ever touch the table on an
 * anonymous customer's behalf.
 *
 * Deliberately the second context (after Orders) that gates its mount-fetch
 * on auth state: the `tokens` list is Admin-UI-only (same reasoning as
 * OrdersContext) — a public visitor never reads it, only ever calls
 * resolveToken/recordDownload, which don't depend on this list at all.
 */
export function DownloadsProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<DownloadToken[]>([]);
  const { settings } = useSettings();
  const { isAuthenticated } = useAuth();
  const { downloadLinkExpiryDays, downloadLinkMaxDownloads } = settings.storage;

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    downloadTokensRepository
      .list()
      .then((rows) => {
        if (cancelled) return;
        setTokens(rows.map(tokenFromSupabaseRow));
      })
      .catch((error) => {
        console.error("Failed to load download tokens from Supabase:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const getTokensForOrder = useCallback(
    (orderId: string) => tokens.filter((t) => t.orderId === orderId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [tokens]
  );

  const mint = useCallback(
    async (orderId: string, fileIds: string[]): Promise<MintedDownloadToken> => {
      const rawToken = generateRawToken();
      const tokenHash = await hashToken(rawToken);
      const row: DownloadTokenRow = {
        id: crypto.randomUUID(),
        order_id: orderId,
        token_hash: tokenHash,
        file_ids: fileIds,
        expires_at: computeExpiresAt(downloadLinkExpiryDays),
        max_downloads: downloadLinkMaxDownloads,
        download_count: 0,
        disabled: false,
        last_downloaded_at: null,
        created_at: new Date().toISOString(),
      };
      // Insert order status is re-verified by the RLS policy itself
      // (download_tokens_insert_editor_or_owner) — an order that isn't
      // actually 'paid' is rejected at the database, not just skipped here.
      const created = await downloadTokensRepository.create(row);
      const token = tokenFromSupabaseRow(created);
      setTokens((prev) => [token, ...prev]);
      return { token, rawToken };
    },
    [downloadLinkExpiryDays, downloadLinkMaxDownloads]
  );

  const generateToken = useCallback((orderId: string, fileIds: string[]) => mint(orderId, fileIds), [mint]);

  const regenerateToken = useCallback(
    async (orderId: string): Promise<MintedDownloadToken | null> => {
      const existing = tokens.filter((t) => t.orderId === orderId);
      if (existing.length === 0) return null;
      const mostRecent = [...existing].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

      await Promise.all(
        existing
          .filter((t) => !t.disabled)
          .map((t) => downloadTokensRepository.update(t.id, { disabled: true }))
      );
      setTokens((prev) => prev.map((t) => (t.orderId === orderId ? { ...t, disabled: true } : t)));

      return mint(orderId, mostRecent.fileIds);
    },
    [tokens, mint]
  );

  const disableToken = useCallback(async (tokenId: string) => {
    await downloadTokensRepository.update(tokenId, { disabled: true });
    setTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, disabled: true } : t)));
  }, []);

  const recordDownload = useCallback(async (rawToken: string) => {
    await recordDownloadTokenUse(rawToken);
  }, []);

  const resolveToken = useCallback(async (rawToken: string) => resolveDownloadToken(rawToken), []);

  const value = useMemo(
    () => ({ tokens, getTokensForOrder, generateToken, regenerateToken, disableToken, recordDownload, resolveToken }),
    [tokens, getTokensForOrder, generateToken, regenerateToken, disableToken, recordDownload, resolveToken]
  );

  return <DownloadsContext.Provider value={value}>{children}</DownloadsContext.Provider>;
}

export function useDownloads() {
  const ctx = useContext(DownloadsContext);
  if (!ctx) throw new Error("useDownloads must be used within DownloadsProvider");
  return ctx;
}

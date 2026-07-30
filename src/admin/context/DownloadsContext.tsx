import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { DownloadToken } from "../types/download";
import { usePersistedState } from "../lib/usePersistedState";
import { useSettings } from "./SettingsContext";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Applies Settings → Storage's download-link policy at the moment a token
 * is (re)generated — already-issued tokens are never retroactively changed
 * if the policy is edited later. `null` in either setting means "no limit". */
function computeExpiresAt(expiryDays: number | null): string | null {
  return expiryDays === null ? null : new Date(Date.now() + expiryDays * DAY_MS).toISOString();
}

interface DownloadsContextValue {
  tokens: DownloadToken[];
  getTokensForOrder: (orderId: string) => DownloadToken[];
  generateToken: (orderId: string, fileIds: string[]) => DownloadToken;
  regenerateToken: (orderId: string) => DownloadToken | null;
  disableToken: (tokenId: string) => void;
  recordDownload: (tokenId: string) => void;
  /** Returns the token only if it exists, isn't disabled, hasn't expired,
   * and hasn't reached its download limit — the one check the public
   * DownloadPage relies on. */
  resolveToken: (tokenId: string) => DownloadToken | null;
}

const DownloadsContext = createContext<DownloadsContextValue | null>(null);

const now = () => new Date().toISOString();

/**
 * Secure-download-token records. IMPORTANT — read before assuming this is
 * "secure" in the real sense: this app has no backend, so a token here is
 * an opaque client-generated id checked against a client-persisted list.
 * Anyone with devtools access to this browser's localStorage could in
 * principle forge a matching record. What this genuinely provides today:
 * (a) no static file path is ever exposed to a customer — only this
 * opaque token is, and (b) the complete data model (expiry, disable,
 * count, reserved analytics fields) a real server-side implementation
 * needs, so moving minting/validation server-side later is a location
 * change, not a redesign. Real security starts the day resolveToken (and
 * generateToken) move into a server/edge function that owns this table
 * instead of the browser.
 */
export function DownloadsProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = usePersistedState<DownloadToken[]>("download_tokens", []);
  const { settings } = useSettings();
  const { downloadLinkExpiryDays, downloadLinkMaxDownloads } = settings.storage;

  const getTokensForOrder = useCallback(
    (orderId: string) => tokens.filter((t) => t.orderId === orderId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [tokens]
  );

  const generateToken = useCallback(
    (orderId: string, fileIds: string[]) => {
      const token: DownloadToken = {
        id: crypto.randomUUID(),
        orderId,
        fileIds,
        createdAt: now(),
        expiresAt: computeExpiresAt(downloadLinkExpiryDays),
        maxDownloads: downloadLinkMaxDownloads,
        disabled: false,
        downloadCount: 0,
        lastDownloadedAt: null,
        clientIp: null,
        deviceInfo: null,
      };
      setTokens((prev) => [token, ...prev]);
      return token;
    },
    [setTokens, downloadLinkExpiryDays, downloadLinkMaxDownloads]
  );

  const regenerateToken = useCallback(
    (orderId: string) => {
      const existing = tokens.filter((t) => t.orderId === orderId);
      if (existing.length === 0) return null;
      const mostRecent = [...existing].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

      const fresh: DownloadToken = {
        id: crypto.randomUUID(),
        orderId,
        fileIds: mostRecent.fileIds,
        createdAt: now(),
        expiresAt: computeExpiresAt(downloadLinkExpiryDays),
        maxDownloads: downloadLinkMaxDownloads,
        disabled: false,
        downloadCount: 0,
        lastDownloadedAt: null,
        clientIp: null,
        deviceInfo: null,
      };
      setTokens((prev) => [fresh, ...prev.map((t) => (t.orderId === orderId ? { ...t, disabled: true } : t))]);
      return fresh;
    },
    [tokens, setTokens, downloadLinkExpiryDays, downloadLinkMaxDownloads]
  );

  const disableToken = useCallback((tokenId: string) => {
    setTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, disabled: true } : t)));
  }, [setTokens]);

  const recordDownload = useCallback((tokenId: string) => {
    setTokens((prev) =>
      prev.map((t) => (t.id === tokenId ? { ...t, downloadCount: t.downloadCount + 1, lastDownloadedAt: now() } : t))
    );
  }, [setTokens]);

  const resolveToken = useCallback(
    (tokenId: string) => {
      const token = tokens.find((t) => t.id === tokenId);
      if (!token) return null;
      if (token.disabled) return null;
      if (token.expiresAt && new Date(token.expiresAt) < new Date()) return null;
      if (token.maxDownloads !== null && token.downloadCount >= token.maxDownloads) return null;
      return token;
    },
    [tokens]
  );

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

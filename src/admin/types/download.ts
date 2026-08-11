export interface DownloadToken {
  /** Internal Supabase row id — admin-facing only (Downloads card, disable
   * action). Never appears in a customer-facing URL; see rawToken below. */
  id: string;
  orderId: string;
  /** LibraryFile ids this token grants access to. */
  fileIds: string[];
  createdAt: string;
  /** null = no expiry. Enforced server-side by resolve_download_token()/
   * record_download_token_use() — real, tamper-proof enforcement, not a
   * client-side-only check. */
  expiresAt: string | null;
  /** null = unlimited downloads. Compared against `downloadCount`
   * server-side by the same two functions. */
  maxDownloads: number | null;
  disabled: boolean;
  downloadCount: number;
  lastDownloadedAt: string | null;
}

/** Returned only once, at the moment a token is (re)generated — the raw
 * bearer value is never persisted (only its SHA-256 hash is, as
 * `token_hash`), so it cannot be recovered later. The caller must use or
 * display it immediately (build the /download/{rawToken} URL, send the
 * email); after that, only regenerating produces a new usable link. */
export interface MintedDownloadToken {
  token: DownloadToken;
  rawToken: string;
}

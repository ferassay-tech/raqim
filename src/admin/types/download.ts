export interface DownloadToken {
  /** The opaque token itself — this is the only thing that ever appears in
   * a customer-facing URL (/download/:token), never a file path. */
  id: string;
  orderId: string;
  /** LibraryFile ids this token grants access to. */
  fileIds: string[];
  createdAt: string;
  /** null = no expiry. Real expiry enforcement (and the other reserved
   * fields below) requires a server — see DownloadsContext's doc comment. */
  expiresAt: string | null;
  disabled: boolean;
  downloadCount: number;
  lastDownloadedAt: string | null;
  /** Reserved for future server-side analytics — always null today; no
   * client-side code can honestly capture a real client IP, and this is
   * declared now so adding real capture later is additive, not a schema
   * change. */
  clientIp: string | null;
  /** Reserved for future server-side analytics — always null today, same
   * reasoning as clientIp. */
  deviceInfo: string | null;
}

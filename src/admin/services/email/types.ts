export type EmailProviderId = "resend" | "smtp";

export interface SendDownloadEmailParams {
  to: string;
  orderId: string;
  downloadUrl: string;
  /** Display-only fields for the email template — none of these affect
   * sending/auth/routing, they're purely what the customer sees rendered
   * in the email itself. All optional so existing callers keep compiling. */
  bookTitle?: string;
  /** Relative or absolute — the template resolves relative paths itself. */
  bookCoverUrl?: string | null;
  maxDownloads?: number | null;
  /** ISO date string, same shape as DownloadToken.expiresAt. */
  expiresAt?: string | null;
}

/**
 * The seam a real transactional-email provider plugs into later — mirrors
 * services/storage's shape exactly. Nothing implements this for real yet
 * (no backend to call a provider's API from), but every call site
 * (OrderDownloadsCard) already calls through this interface, so wiring
 * Resend (or any other provider) later is writing one adapter file and
 * registering it in ./index.ts — not adding a new call site.
 */
export interface EmailProvider {
  id: EmailProviderId;
  label: string;
  sendDownloadEmail(params: SendDownloadEmailParams): Promise<void>;
}

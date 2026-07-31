export type EmailProviderId = "resend" | "smtp";

export interface SendDownloadEmailParams {
  to: string;
  orderId: string;
  downloadUrl: string;
  /** The Download Email template's sections, already rendered to HTML via
   * renderTemplateToHtml() on the caller's side (only the browser has
   * access to Communication Templates — this serverless function does
   * not). The server uses this directly as the email body. */
  contentHtml: string;
  /** No longer used to build the email body (contentHtml replaced that) —
   * kept optional so existing callers keep compiling without changes. */
  bookTitle?: string;
  bookCoverUrl?: string | null;
  maxDownloads?: number | null;
  /** ISO date string, same shape as DownloadToken.expiresAt. */
  expiresAt?: string | null;
}

/**
 * The seam a real transactional-email provider plugs into — mirrors
 * services/storage's shape exactly. resendAdapter.ts is the real
 * implementation (calls api/send-download-email.ts); wiring an additional
 * provider later is writing one more adapter file and registering it in
 * ./index.ts, not adding a new call site.
 */
export interface EmailProvider {
  id: EmailProviderId;
  label: string;
  sendDownloadEmail(params: SendDownloadEmailParams): Promise<void>;
}

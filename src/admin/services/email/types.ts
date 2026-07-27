export type EmailProviderId = "resend" | "smtp";

export interface SendDownloadEmailParams {
  to: string;
  orderId: string;
  downloadUrl: string;
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

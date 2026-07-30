import type { EmailProvider, EmailProviderId } from "./types";
import { resendAdapter } from "./resendAdapter";

export type { EmailProvider, EmailProviderId, SendDownloadEmailParams } from "./types";

function notConfigured(providerId: EmailProviderId): EmailProvider {
  return {
    id: providerId,
    label: `${providerId} (غير مُهيّأ بعد)`,
    async sendDownloadEmail() {
      throw new Error(
        `Email provider "${providerId}" is not configured yet. Implement EmailProvider (src/admin/services/email/types.ts) against the real API (e.g. Resend), then register it below.`
      );
    },
  };
}

/** `resend` is the one real, working provider today — see resendAdapter.ts.
 * It calls a Vercel serverless function rather than Resend directly, so its
 * API key never reaches the client. `smtp` remains a named, honestly-non-
 * functional stub — wiring it later is writing one adapter file and
 * replacing its entry here, same as `resend` just was. */
export const EMAIL_PROVIDERS: Record<EmailProviderId, EmailProvider> = {
  resend: resendAdapter,
  smtp: notConfigured("smtp"),
};

export function getEmailProvider(providerId: EmailProviderId): EmailProvider {
  return EMAIL_PROVIDERS[providerId];
}

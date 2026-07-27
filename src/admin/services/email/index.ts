import type { EmailProvider, EmailProviderId } from "./types";

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

/** No email provider is wired yet — this app has no backend to call one
 * from. Present as named, honestly-non-functional stubs so the UI (the
 * "إرسال عبر البريد الإلكتروني" button on OrderDownloadsCard) has a real
 * interface to call today, and a real integration later is one file. */
export const EMAIL_PROVIDERS: Record<EmailProviderId, EmailProvider> = {
  resend: notConfigured("resend"),
  smtp: notConfigured("smtp"),
};

export function getEmailProvider(providerId: EmailProviderId): EmailProvider {
  return EMAIL_PROVIDERS[providerId];
}

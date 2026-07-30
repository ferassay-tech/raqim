import type { EmailProvider } from "./types";

/**
 * Real transactional email — routes through /api/send-download-email (a
 * Vercel serverless function) rather than calling Resend directly from the
 * client. Resend's API key grants full send-as-this-domain access and must
 * never reach the browser bundle; that function is the one place holding it
 * (RESEND_API_KEY / RESEND_FROM_EMAIL as plain Vercel project env vars —
 * never VITE_-prefixed, never shipped to the client).
 */
export const resendAdapter: EmailProvider = {
  id: "resend",
  label: "Resend",

  async sendDownloadEmail(params) {
    const response = await fetch("/api/send-download-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error ?? "تعذّر إرسال البريد الإلكتروني.");
    }
  },
};

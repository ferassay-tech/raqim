import type { EmailProvider } from "./types";
import { getSupabaseClient } from "../../../lib/supabaseClient";

/**
 * Real transactional email — routes through /api/send-download-email (a
 * Vercel serverless function) rather than calling Resend directly from the
 * client. Resend's API key grants full send-as-this-domain access and must
 * never reach the browser bundle; that function is the one place holding it
 * (RESEND_API_KEY / RESEND_FROM_EMAIL as plain Vercel project env vars —
 * never VITE_-prefixed, never shipped to the client).
 *
 * Phase 1 security hardening: the endpoint now requires the caller's own
 * Supabase access token (server-side verifies it and checks orders.manage
 * before sending — see api/send-download-email.ts). Attaching it here is
 * the only change needed on this side; sendDownloadEmail's own params
 * shape and every caller (OrderDetailPage.tsx) are unchanged.
 */
export const resendAdapter: EmailProvider = {
  id: "resend",
  label: "Resend",

  async sendDownloadEmail(params) {
    const supabase = getSupabaseClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      throw new Error("لا توجد جلسة نشطة.");
    }

    const response = await fetch("/api/send-download-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error ?? "تعذّر إرسال البريد الإلكتروني.");
    }
  },
};

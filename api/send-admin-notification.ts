/**
 * Vercel serverless function — notifies the platform owner by email when an
 * admin invitation has been accepted and now needs their review (approve or
 * reject). Mirrors notify-new-conversation.ts / send-download-email.ts's
 * exact shape: a Resend API key must never reach the client bundle, so
 * every Resend call in this project goes through a function like this one.
 *
 * The recipient is deliberately NOT taken from the request body — same
 * reasoning as notify-new-conversation.ts: a client-supplied `to` would let
 * anyone use this project's Resend account to email a third party. It's
 * always OWNER_NOTIFICATION_EMAIL (env), falling back to the real,
 * confirmed platform owner address if that env var isn't set. This value is
 * used only to route a notification email — it is never an authorization
 * check; who actually holds owner/admin access is decided entirely by
 * platform_ownership / admin_profiles / the SECURITY DEFINER functions in
 * migration 20260818130001, not by this constant.
 *
 * This endpoint does not verify the invitation exists before sending (same
 * accepted tradeoff as notify-new-conversation.ts — no service-role key is
 * available to this runtime). A direct call without a real invitation only
 * results in a nuisance email in the owner's own inbox, not data exposure.
 *
 * Deliberately self-contained (no imports from src/): cross-directory
 * imports out of api/ previously broke a deployed function at runtime
 * (FUNCTION_INVOCATION_FAILED, see commit 6d47917).
 *
 * Not yet wired to fire automatically — accept_admin_invitation() (the DB
 * function that reaches the "needs review" moment) has no network access
 * from inside Postgres in this project today. Calling this endpoint after
 * that RPC succeeds is trusted, server-triggered application code to add
 * once the accept-invitation UI exists (Phase 2B) — this file is the ready,
 * secure piece that step will call.
 */
const DEFAULT_OWNER_NOTIFICATION_EMAIL = "raqim.house@gmail.com";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { email, role, invitationId } = (req.body ?? {}) as {
    email?: string;
    role?: string;
    invitationId?: string;
  };

  if (!email || !role || !invitationId) {
    res.status(400).json({ error: "Missing required fields: email, role, invitationId" });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const toEmail = process.env.OWNER_NOTIFICATION_EMAIL || DEFAULT_OWNER_NOTIFICATION_EMAIL;
  if (!apiKey || !fromEmail) {
    res.status(500).json({ error: "Email is not configured on the server (RESEND_API_KEY / RESEND_FROM_EMAIL)." });
    return;
  }

  const escapedEmail = escapeHtml(email);
  const escapedRole = escapeHtml(role);
  const subject = `طلب مراجعة صلاحية إدارية جديد — رقيم`;
  const html = `
    <p>قبِل أحد المدعوين دعوته للانضمام إلى لوحة تحكم رقيم، وينتظر مراجعتك الآن.</p>
    <p><strong>البريد الإلكتروني:</strong> ${escapedEmail}</p>
    <p><strong>الصلاحية المطلوبة:</strong> ${escapedRole}</p>
    <p>يمكنك الموافقة أو الرفض من لوحة إدارة المستخدمين.</p>
  `;

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: fromEmail, to: [toEmail], subject, html }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error("Resend API error:", resendResponse.status, errorBody);
      res.status(502).json({ error: "Email provider rejected the request." });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Failed to reach Resend API:", err);
    res.status(502).json({ error: "Could not reach the email provider." });
  }
}

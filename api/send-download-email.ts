/**
 * Vercel serverless function — the one place this app talks to Resend.
 * Exists because a Resend API key grants full send-as-this-domain access
 * and must never reach the client bundle (unlike Supabase's anon key,
 * which is safe to ship publicly because Storage RLS scopes it). The
 * client-side resendAdapter (src/admin/services/email/resendAdapter.ts)
 * only ever calls this endpoint; it never sees the real key.
 *
 * The email body (`contentHtml`) is rendered on the caller's side from the
 * Download Email Communication Template via renderTemplateToHtml() — this
 * function only has Node/serverless access, not the browser's
 * localStorage, so it cannot load templates itself. It just sends
 * whatever HTML it's given; it has no HTML-generation logic of its own.
 *
 * Deliberately self-contained (no imports from src/): cross-directory
 * imports out of api/ previously broke the deployed function at runtime
 * (FUNCTION_INVOCATION_FAILED).
 */
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { to, orderId, contentHtml } = (req.body ?? {}) as {
    to?: string;
    orderId?: string;
    contentHtml?: string;
  };

  if (!to || !orderId || !contentHtml) {
    res.status(400).json({ error: "Missing required fields: to, orderId, contentHtml" });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    res.status(500).json({ error: "Email is not configured on the server (RESEND_API_KEY / RESEND_FROM_EMAIL)." });
    return;
  }

  const subject = "نسختك الرقمية أصبحت جاهزة — رقيم";

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: fromEmail, to: [to], subject, html: contentHtml }),
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

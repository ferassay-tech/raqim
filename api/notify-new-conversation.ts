/**
 * Vercel serverless function — notifies the admin by email when a new
 * conversation arrives via the public contact form. Mirrors
 * send-download-email.ts's shape exactly (same reason: a Resend API key
 * must never reach the client bundle).
 *
 * The recipient is deliberately NOT taken from the request body: if a
 * caller could specify an arbitrary `to`, this endpoint would let anyone
 * use this project's Resend account to email a third party. It's always
 * ADMIN_NOTIFICATION_EMAIL (env), falling back to the same literal value
 * as CONTACT_EMAILS.contact in src/config/contactEmails.ts ("contact@
 * r-aqim.com") if that env var isn't set — duplicated here, not
 * imported, since this file deliberately has no imports from src/ (see
 * send-download-email.ts's own comment on why).
 *
 * This endpoint doesn't verify a real conversation exists before
 * sending (that would need a SUPABASE_SERVICE_ROLE_KEY, a secret this
 * app's runtime has never used). A direct call here without a real
 * conversation only results in a nuisance email landing in the site's
 * own inbox — not third-party spam, not data exposure — so basic
 * payload validation is the accepted v1-appropriate mitigation.
 *
 * Deliberately self-contained (no imports from src/): cross-directory
 * imports out of api/ previously broke the deployed function at runtime
 * (FUNCTION_INVOCATION_FAILED).
 */

const DEFAULT_ADMIN_NOTIFICATION_EMAIL = "contact@r-aqim.com";
const MAX_MESSAGE_LENGTH = 5000;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { customerName, customerEmail, message } = (req.body ?? {}) as {
    customerName?: string;
    customerEmail?: string;
    message?: string;
  };

  if (!customerName || !customerEmail || !message) {
    res.status(400).json({ error: "Missing required fields: customerName, customerEmail, message" });
    return;
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    res.status(400).json({ error: "Message too long" });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const toEmail = process.env.ADMIN_NOTIFICATION_EMAIL || DEFAULT_ADMIN_NOTIFICATION_EMAIL;
  if (!apiKey || !fromEmail) {
    res.status(500).json({ error: "Email is not configured on the server (RESEND_API_KEY / RESEND_FROM_EMAIL)." });
    return;
  }

  const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escapedCustomerName = escapeHtml(customerName);
  const escapedCustomerEmail = escapeHtml(customerEmail);
  const escapedMessage = escapeHtml(message);
  const subject = `رسالة تواصل جديدة من ${customerName} — رقيم`;
  const html = `
    <p>وصلت رسالة جديدة عبر نموذج التواصل:</p>
    <p><strong>الاسم:</strong> ${escapedCustomerName}</p>
    <p><strong>البريد الإلكتروني:</strong> ${escapedCustomerEmail}</p>
    <p><strong>الرسالة:</strong></p>
    <p>${escapedMessage}</p>
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

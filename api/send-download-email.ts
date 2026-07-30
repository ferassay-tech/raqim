/**
 * Vercel serverless function — the one place this app talks to Resend.
 * Exists because a Resend API key grants full send-as-this-domain access
 * and must never reach the client bundle (unlike Supabase's anon key,
 * which is safe to ship publicly because Storage RLS scopes it). The
 * client-side resendAdapter (src/admin/services/email/resendAdapter.ts)
 * only ever calls this endpoint; it never sees the real key.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { to, orderId, downloadUrl } = (req.body ?? {}) as {
    to?: string;
    orderId?: string;
    downloadUrl?: string;
  };

  if (!to || !orderId || !downloadUrl) {
    res.status(400).json({ error: "Missing required fields: to, orderId, downloadUrl" });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    res.status(500).json({ error: "Email is not configured on the server (RESEND_API_KEY / RESEND_FROM_EMAIL)." });
    return;
  }

  const subject = "رابط تحميل كتابك — رقيم";
  const html = `
    <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background:#fbf6ed; padding:32px; color:#2c2420;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:10px;padding:32px;border:1px solid #f1e9da;">
        <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#b99451;margin:0 0 12px;">رقيم</p>
        <h1 style="font-size:20px;margin:0 0 16px;">نسختك جاهزة للتحميل</h1>
        <p style="font-size:14px;line-height:1.8;margin:0 0 24px;">
          شكرًا لثقتك بنا. رابط تحميل نسختك الرقمية جاهز الآن — يخص طلبك رقم
          <strong dir="ltr">${orderId}</strong>.
        </p>
        <p style="text-align:center;margin:0 0 24px;">
          <a href="${downloadUrl}" style="display:inline-block;background:#b99451;color:#2c2420;text-decoration:none;
             padding:14px 28px;border-radius:10px;font-weight:600;font-size:14px;">
            تحميل نسختي الآن
          </a>
        </p>
        <p style="font-size:12px;color:#8a7d70;line-height:1.7;margin:0;">
          هذا الرابط شخصي وقد يكون محدود المدة أو عدد مرات الاستخدام — يرجى عدم مشاركته مع الآخرين.
        </p>
      </div>
    </div>
  `;

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: fromEmail, to: [to], subject, html }),
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

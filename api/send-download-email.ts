import { absoluteUrl, SITE_URL } from "../src/lib/seo";
import { BRAND_ASSETS } from "../src/config/brandAssets";
import { CONTACT_EMAILS } from "../src/config/contactEmails";

/**
 * Vercel serverless function — the one place this app talks to Resend.
 * Exists because a Resend API key grants full send-as-this-domain access
 * and must never reach the client bundle (unlike Supabase's anon key,
 * which is safe to ship publicly because Storage RLS scopes it). The
 * client-side resendAdapter (src/admin/services/email/resendAdapter.ts)
 * only ever calls this endpoint; it never sees the real key.
 *
 * Everything below `buildEmailHtml` is presentation only — the auth,
 * validation, and Resend call are unchanged from the original integration.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { to, orderId, downloadUrl, bookTitle, bookCoverUrl, maxDownloads, expiresAt } = (req.body ?? {}) as {
    to?: string;
    orderId?: string;
    downloadUrl?: string;
    bookTitle?: string;
    bookCoverUrl?: string | null;
    maxDownloads?: number | null;
    expiresAt?: string | null;
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

  const subject = "نسختك الرقمية أصبحت جاهزة — رقيم";
  const html = buildEmailHtml({ orderId, downloadUrl, bookTitle, bookCoverUrl, maxDownloads, expiresAt });

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

function formatExpiry(expiresAt?: string | null): string {
  if (!expiresAt) return "بلا انتهاء";
  try {
    return new Date(expiresAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "بلا انتهاء";
  }
}

/**
 * Table-based layout, inline styles only, a single <style> block used
 * strictly for the one mobile breakpoint — this is the "bulletproof email"
 * pattern: Outlook's Word-based renderer ignores flexbox/grid entirely and
 * strips most <style> rules, so nothing here relies on either. Colors are
 * the exact tokens from src/index.css's @theme (gold #b99451, ink #2c2420,
 * ivory #fbf6ed, etc.) so the email matches the site without importing any
 * CSS build — email clients don't run Tailwind.
 */
function buildEmailHtml(params: {
  orderId: string;
  downloadUrl: string;
  bookTitle?: string;
  bookCoverUrl?: string | null;
  maxDownloads?: number | null;
  expiresAt?: string | null;
}): string {
  const { orderId, downloadUrl, bookTitle, bookCoverUrl, maxDownloads, expiresAt } = params;
  const logoUrl = absoluteUrl(BRAND_ASSETS.logo);
  const coverUrl = bookCoverUrl ? absoluteUrl(bookCoverUrl) : null;
  const maxDownloadsLabel = maxDownloads == null ? "بلا حد" : String(maxDownloads);
  const expiryLabel = formatExpiry(expiresAt);
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light" />
<title>نسختك الرقمية أصبحت جاهزة — رقيم</title>
<style>
  @media only screen and (max-width: 600px) {
    .raqim-container { width: 100% !important; }
    .raqim-px { padding-left: 20px !important; padding-right: 20px !important; }
    .raqim-book-cell { display: block !important; width: 100% !important; text-align: center !important; }
    .raqim-book-cover { margin: 0 auto 16px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#fbf6ed;" dir="rtl">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fbf6ed;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" class="raqim-container" width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;background-color:#ffffff;border-radius:14px;border:1px solid #f1e9da;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#2c2420;padding:28px 24px;">
              <img src="${logoUrl}" width="44" height="44" alt="رقيم" style="display:block;margin:0 auto 10px;border:0;" />
              <div style="font-family:Georgia,'Times New Roman',serif;color:#f6efe2;font-size:20px;letter-spacing:3px;">رقيم</div>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td class="raqim-px" align="center" style="padding:40px 40px 20px;font-family:Tahoma,Arial,sans-serif;">
              <p style="margin:0 0 10px;color:#b99451;font-size:12px;letter-spacing:3px;text-transform:uppercase;">جاهز للتحميل</p>
              <h1 style="margin:0 0 16px;color:#2c2420;font-size:25px;line-height:1.4;font-weight:700;">نسختك الرقمية أصبحت جاهزة</h1>
              <p style="margin:0;color:#5c5147;font-size:14.5px;line-height:1.9;">
                شكرًا لثقتك بنا — يسعدنا أن نرافقك في هذه الرحلة. نسختك جاهزة الآن، ونتمنى أن تنال إعجابك.
              </p>
            </td>
          </tr>

          <!-- Book card -->
          <tr>
            <td class="raqim-px" style="padding:8px 40px 24px;font-family:Tahoma,Arial,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="background-color:#f6efe2;border-radius:12px;border:1px solid #f1e9da;">
                <tr>
                  ${
                    coverUrl
                      ? `<td class="raqim-book-cell" width="100" valign="middle" style="padding:20px 0 20px 20px;">
                          <img class="raqim-book-cover" src="${coverUrl}" width="76" alt="${escapeHtml(bookTitle ?? "غلاف الكتاب")}"
                            style="display:block;border-radius:6px;box-shadow:0 10px 24px -8px rgba(44,36,32,0.35);" />
                        </td>`
                      : ""
                  }
                  <td valign="middle" style="padding:20px;">
                    <p style="margin:0;color:#8a7d70;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">الكتاب</p>
                    <p style="margin:6px 0 0;color:#2c2420;font-size:19px;font-weight:700;font-family:Georgia,'Times New Roman',serif;">
                      ${escapeHtml(bookTitle ?? "إصدار رقيم")}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:0 40px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="border-radius:10px;background-color:#b99451;">
                    <a href="${downloadUrl}" target="_blank"
                      style="display:inline-block;padding:16px 44px;color:#2c2420;font-family:Tahoma,Arial,sans-serif;font-size:15.5px;font-weight:700;text-decoration:none;">
                      تحميل الكتاب الآن
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order info -->
          <tr>
            <td class="raqim-px" style="padding:0 40px 20px;font-family:Tahoma,Arial,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f1e9da;border-radius:10px;">
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #f1e9da;">
                    <table role="presentation" width="100%"><tr>
                      <td style="color:#8a7d70;font-size:12.5px;">رقم الطلب</td>
                      <td align="left" dir="ltr" style="color:#2c2420;font-size:12.5px;font-weight:700;">${escapeHtml(orderId)}</td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #f1e9da;">
                    <table role="presentation" width="100%"><tr>
                      <td style="color:#8a7d70;font-size:12.5px;">الحد الأقصى للتحميلات</td>
                      <td align="left" dir="ltr" style="color:#2c2420;font-size:12.5px;font-weight:700;">${escapeHtml(maxDownloadsLabel)}</td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;">
                    <table role="presentation" width="100%"><tr>
                      <td style="color:#8a7d70;font-size:12.5px;">تنتهي الصلاحية</td>
                      <td align="left" style="color:#2c2420;font-size:12.5px;font-weight:700;">${escapeHtml(expiryLabel)}</td>
                    </tr></table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notice -->
          <tr>
            <td class="raqim-px" style="padding:0 40px 36px;font-family:Tahoma,Arial,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fbf6ed;border-radius:10px;border:1px dashed #e3d5b8;">
                <tr>
                  <td style="padding:16px 18px;color:#8a7d70;font-size:12px;line-height:2;">
                    هذا الرابط شخصي وخاص بحسابك — يرجى عدم مشاركته مع أحد. الرابط محدود بعدد مرات التحميل وتاريخ الصلاحية الموضحين أعلاه، وسيتوقف عن العمل بعدهما.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:#2c2420;padding:26px 24px;font-family:Tahoma,Arial,sans-serif;">
              <p style="margin:0 0 8px;color:#cfae6d;font-size:13px;font-family:Georgia,serif;letter-spacing:1px;">رقيم</p>
              <p style="margin:0 0 6px;color:#cbbfae;font-size:12px;">
                لأي استفسار: <a href="mailto:${CONTACT_EMAILS.support}" style="color:#cfae6d;text-decoration:none;">${CONTACT_EMAILS.support}</a>
              </p>
              <p style="margin:0;color:#8a7d70;font-size:11px;">© ${year} رقيم — ${SITE_URL.replace("https://", "")}. جميع الحقوق محفوظة.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

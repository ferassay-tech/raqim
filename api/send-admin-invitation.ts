/**
 * Vercel serverless function — sends the admin INVITATION email (owner →
 * invitee), the missing half of the two-email admin-invite flow. The other
 * half, api/send-admin-notification.ts (invitee → owner, "please review"),
 * already exists and is untouched by this file.
 *
 * Mirrors send-download-email.ts / send-admin-notification.ts's exact
 * shape: a Resend API key must never reach the client bundle, so every
 * Resend call in this project goes through a function like this one.
 * Deliberately self-contained (no imports from src/) — cross-directory
 * imports out of api/ previously broke a deployed function at runtime
 * (FUNCTION_INVOCATION_FAILED, see commit 6d47917) — the constants below
 * are copies, not imports, of src/lib/seo.ts's SITE_URL and this project's
 * brand tokens (ink #2c2420, gold #b99451, ivory #fbf6ed).
 *
 * The raw invitation token is never logged — only ever used to build the
 * accept-invitation URL — since it's a bearer credential for
 * accept_admin_invitation() (whoever holds it can accept the invite).
 */
const SITE_URL = "https://www.r-aqim.com";
const LOGO_PATH = "/Raqim-logo.webp";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "مدير عام",
  admin: "مدير",
  editor: "محرر",
  analyst: "محلل",
};

function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatExpiry(expiresAt: string): string {
  try {
    return new Date(expiresAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return expiresAt;
  }
}

function buildEmailHtml(params: { email: string; roleLabel: string; expiryLabel: string; acceptUrl: string }): string {
  const { email, roleLabel, expiryLabel, acceptUrl } = params;
  const logoUrl = absoluteUrl(LOGO_PATH);
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light" />
<title>دعوة للانضمام إلى لوحة تحكم رَقِيم</title>
</head>
<body style="margin:0;padding:0;background-color:#fbf6ed;" dir="rtl">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fbf6ed;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;background-color:#ffffff;border-radius:14px;border:1px solid #f1e9da;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#2c2420;padding:28px 24px;">
              <img src="${logoUrl}" width="44" height="44" alt="رقيم" style="display:block;margin:0 auto 10px;border:0;" />
              <div style="font-family:Georgia,'Times New Roman',serif;color:#f6efe2;font-size:20px;letter-spacing:3px;">رقيم</div>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding:36px 40px 8px;font-family:Tahoma,Arial,sans-serif;text-align:center;">
              <p style="margin:0;color:#8a7d70;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">دعوة إدارية</p>
              <h1 style="margin:10px 0 0;color:#2c2420;font-size:22px;font-family:Georgia,'Times New Roman',serif;">
                تمت دعوتك للانضمام إلى فريق إدارة رقيم
              </h1>
              <p style="margin:14px 0 0;color:#5a4f45;font-size:14px;line-height:1.9;">
                تلقّى <span dir="ltr" style="color:#2c2420;font-weight:700;">${escapeHtml(email)}</span> دعوة للانضمام إلى
                لوحة تحكم رقيم بصلاحية <strong style="color:#2c2420;">${escapeHtml(roleLabel)}</strong>.
                اضغطي على الزر أدناه لإنشاء حسابك وقبول الدعوة.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:28px 40px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="border-radius:999px;background-color:#2c2420;">
                    <a href="${acceptUrl}" target="_blank"
                      style="display:inline-block;padding:14px 36px;font-family:Tahoma,Arial,sans-serif;font-size:14px;font-weight:700;color:#fbf6ed;text-decoration:none;border-radius:999px;">
                      قبول الدعوة
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding:24px 40px 8px;font-family:Tahoma,Arial,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f1e9da;border-radius:10px;">
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #f1e9da;">
                    <table role="presentation" width="100%"><tr>
                      <td style="color:#8a7d70;font-size:12.5px;">الصلاحية الممنوحة</td>
                      <td align="left" style="color:#2c2420;font-size:12.5px;font-weight:700;">${escapeHtml(roleLabel)}</td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;">
                    <table role="presentation" width="100%"><tr>
                      <td style="color:#8a7d70;font-size:12.5px;">تنتهي صلاحية الدعوة في</td>
                      <td align="left" style="color:#2c2420;font-size:12.5px;font-weight:700;">${escapeHtml(expiryLabel)}</td>
                    </tr></table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notice -->
          <tr>
            <td style="padding:20px 40px 36px;font-family:Tahoma,Arial,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fbf6ed;border-radius:10px;border:1px dashed #e3d5b8;">
                <tr>
                  <td style="padding:16px 18px;color:#8a7d70;font-size:12px;line-height:2;">
                    إن لم تكوني تتوقعين هذه الدعوة، يمكنك تجاهل هذه الرسالة بأمان — لن يُمنح أي وصول دون الضغط على
                    الزر أعلاه وإتمام إنشاء الحساب.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:#2c2420;padding:26px 24px;font-family:Tahoma,Arial,sans-serif;">
              <p style="margin:0 0 6px;color:#cfae6d;font-size:13px;font-family:Georgia,serif;letter-spacing:1px;">رقيم</p>
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

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { email, role, token, expiresAt } = (req.body ?? {}) as {
    email?: string;
    role?: string;
    token?: string;
    expiresAt?: string;
  };

  if (!email || !role || !token || !expiresAt) {
    res.status(400).json({ error: "Missing required fields: email, role, token, expiresAt" });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    res.status(500).json({ error: "Email is not configured on the server (RESEND_API_KEY / RESEND_FROM_EMAIL)." });
    return;
  }

  const roleLabel = ROLE_LABELS[role] ?? role;
  const acceptUrl = `${SITE_URL}/admin/accept-invitation?invite_token=${encodeURIComponent(token)}`;
  const subject = "دعوة للانضمام إلى لوحة تحكم رَقِيم";
  const html = buildEmailHtml({ email, roleLabel, expiryLabel: formatExpiry(expiresAt), acceptUrl });

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: fromEmail, to: [email], subject, html }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      // Never log `token` — only status/response body from Resend itself.
      console.error("Resend API error (admin invitation email):", resendResponse.status, errorBody);
      res.status(502).json({ error: "Email provider rejected the request." });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Failed to reach Resend API (admin invitation email):", err);
    res.status(502).json({ error: "Could not reach the email provider." });
  }
}

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
 *
 * Phase 1 security hardening: this endpoint previously trusted email/role/
 * expiresAt from the client with no authentication at all — an
 * unauthenticated caller could relay an official-looking Raqim invitation
 * email to any address. Now: (1) the caller must present a valid Supabase
 * access token (Authorization: Bearer ...) for the admin who is sending
 * the invitation, verified via supabase.auth.getUser() — never a
 * client-asserted identity; (2) that caller must be the platform owner,
 * checked against platform_ownership.owner_profile_id — the same
 * authoritative source (and the same owner-only requirement) every admin-
 * invitation RPC in this project already enforces
 * (create_admin_invitation/resend_admin_invitation/etc., all
 * current_admin_role() = 'owner'); (3) email/role/expiry are re-derived
 * from the real admin_invitations row (looked up by re-hashing the raw
 * invitation token with the exact sha256 scheme those RPCs already use to
 * store token_hash) rather than trusted from the client, and the send is
 * refused if that row isn't genuinely pending and unexpired.
 */
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";

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

  const authHeader = (req.headers?.authorization ?? req.headers?.Authorization) as string | undefined;
  const sessionToken =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!sessionToken) {
    res.status(401).json({ error: "Missing or invalid Authorization header." });
    return;
  }

  // `token` here is the invitation's own raw bearer token (used only to
  // build the accept-invitation link and to look up the real invitation
  // row below) — distinct from `sessionToken` above, the caller admin's
  // own session credential.
  const { token } = (req.body ?? {}) as { token?: string };
  if (!token) {
    res.status(400).json({ error: "Missing required field: token" });
    return;
  }

  const url = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!url || !serviceRoleKey) {
    res.status(500).json({ error: "Server is not configured." });
    return;
  }
  if (!apiKey || !fromEmail) {
    res.status(500).json({ error: "Email is not configured on the server (RESEND_API_KEY / RESEND_FROM_EMAIL)." });
    return;
  }

  const serviceClient = createClient(url, serviceRoleKey);

  // Authenticate the caller — verifies the JWT itself, never a
  // client-asserted identity.
  const { data: userData, error: userError } = await serviceClient.auth.getUser(sessionToken);
  if (userError || !userData?.user) {
    res.status(401).json({ error: "Invalid or expired session." });
    return;
  }

  // Authorize — owner-only, matching every admin-invitation RPC's own
  // current_admin_role() = 'owner' requirement exactly (platform_ownership
  // is the same authoritative source AdminUsersContext.isOwner already
  // uses client-side).
  const { data: ownership, error: ownershipError } = await serviceClient
    .from("platform_ownership")
    .select("owner_profile_id")
    .maybeSingle();
  if (ownershipError) {
    console.error("Failed to resolve platform ownership:", ownershipError);
    res.status(500).json({ error: "Could not verify ownership." });
    return;
  }
  if (!ownership || ownership.owner_profile_id !== userData.user.id) {
    res.status(403).json({ error: "Only the platform owner may send admin invitations." });
    return;
  }

  // Re-derive email/role/expiry from the real invitation row — never trust
  // the client's assertion of what invitation this is. Same sha256 hex
  // scheme create_admin_invitation()/resend_admin_invitation() already use
  // to store token_hash (confirmed in their own migrations).
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { data: invitation, error: invitationError } = await serviceClient
    .from("admin_invitations")
    .select("email, role, status, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (invitationError) {
    console.error("Failed to look up invitation:", invitationError);
    res.status(500).json({ error: "Could not verify the invitation." });
    return;
  }
  if (!invitation || invitation.status !== "pending" || new Date(invitation.expires_at) <= new Date()) {
    res.status(400).json({ error: "This invitation is not valid or has expired." });
    return;
  }

  const roleLabel = ROLE_LABELS[invitation.role] ?? invitation.role;
  const acceptUrl = `${SITE_URL}/admin/accept-invitation?invite_token=${encodeURIComponent(token)}`;
  const subject = "دعوة للانضمام إلى لوحة تحكم رَقِيم";
  const html = buildEmailHtml({
    email: invitation.email,
    roleLabel,
    expiryLabel: formatExpiry(invitation.expires_at),
    acceptUrl,
  });

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: fromEmail, to: [invitation.email], subject, html }),
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

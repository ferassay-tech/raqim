/**
 * Canonical definition of the premium Download Email's chrome — the brand
 * header/footer bars, book card, order-info table, and security notice that
 * wrap a template's admin-editable content rows. Extracted verbatim from
 * api/send-download-email.ts's buildEmailDocument() (the function that
 * actually builds the email Resend sends), not redesigned.
 *
 * This file is deliberately a pure leaf module — no imports of its own —
 * so it's safe for the Vite/src bundle (used by the admin Template Preview,
 * see TemplatePreviewModal.tsx) to import directly.
 *
 * It is NOT imported by api/send-download-email.ts. That file must stay
 * self-contained: a prior attempt to import shared src/ constants from a
 * Vercel serverless function broke it at runtime (FUNCTION_INVOCATION_FAILED,
 * see commit 6d47917) even though the imported files were just as simple as
 * this one. api/send-download-email.ts therefore keeps its own literal copy
 * of this exact structure — this module is the canonical source to edit
 * first; keep the two in sync by hand (see the matching comment there).
 */
const SITE_URL = "https://r-aqim.com";
const LOGO_PATH = "/Raqim-logo.webp";
const SUPPORT_EMAIL = "support@r-aqim.com";

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

function formatExpiry(expiresAt?: string | null): string {
  if (!expiresAt) return "بلا انتهاء";
  try {
    return new Date(expiresAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "بلا انتهاء";
  }
}

/** Structurally the same shape as DownloadEmailDesignSettings
 * (types/template.ts) — declared locally rather than imported so this file
 * keeps its "zero imports of its own" invariant (see file header); TS
 * structural typing means a real DownloadEmailDesignSettings value is
 * assignable here without any coupling. Every field optional and defaulted
 * below, so a caller that omits `design` entirely (or omits individual
 * fields) reproduces exactly today's hardcoded premium look. */
export interface DownloadEmailDesignOverrides {
  showBrandHeader?: boolean;
  showBookCard?: boolean;
  showOrderInfo?: boolean;
  showSecurityNotice?: boolean;
  showBrandFooterBar?: boolean;
  backgroundColor?: string;
  accentColor?: string;
  inkColor?: string;
}

const DEFAULT_DESIGN: Required<DownloadEmailDesignOverrides> = {
  showBrandHeader: true,
  showBookCard: true,
  showOrderInfo: true,
  showSecurityNotice: true,
  showBrandFooterBar: true,
  backgroundColor: "#fbf6ed",
  accentColor: "#b99451",
  inkColor: "#2c2420",
};

export interface DownloadEmailDocumentParams {
  orderId: string;
  /** The admin-editable hero/message/CTA/footer-note rows, already rendered
   * via renderTemplateToHtml() — this module wraps them, it doesn't build
   * them. */
  contentRows: string;
  bookTitle?: string;
  bookCoverUrl?: string | null;
  maxDownloads?: number | null;
  expiresAt?: string | null;
  /** Omitted entirely by the one real production caller
   * (api/send-download-email.ts keeps its own separate literal copy of this
   * function and never had this param to begin with) — every field falls
   * back to DEFAULT_DESIGN, so this is purely additive. */
  design?: DownloadEmailDesignOverrides;
}

/**
 * Table-based layout, inline styles only, a single <style> block used
 * strictly for the one mobile breakpoint — the "bulletproof email" pattern:
 * Outlook's Word-based renderer ignores flexbox/grid entirely and strips
 * most <style> rules, so nothing here relies on either.
 */
export function buildDownloadEmailDocument(params: DownloadEmailDocumentParams): string {
  const { orderId, contentRows, bookTitle, bookCoverUrl, maxDownloads, expiresAt } = params;
  const design = { ...DEFAULT_DESIGN, ...params.design };
  const logoUrl = absoluteUrl(LOGO_PATH);
  const coverUrl = bookCoverUrl ? absoluteUrl(bookCoverUrl) : null;
  const maxDownloadsLabel = maxDownloads == null ? "بلا حد" : String(maxDownloads);
  const expiryLabel = formatExpiry(expiresAt);
  const year = new Date().getFullYear();
  // accentColor (design.accentColor) isn't used in this file's own chrome
  // markup — the CTA button/eyebrow that use it live in `contentRows`,
  // rendered separately by renderTemplateToHtml() with the same value.
  const { backgroundColor, inkColor } = design;

  const headerRow = design.showBrandHeader
    ? `
          <!-- Header -->
          <tr>
            <td align="center" style="background-color:${inkColor};padding:28px 24px;">
              <img src="${logoUrl}" width="44" height="44" alt="رقيم" style="display:block;margin:0 auto 10px;border:0;" />
              <div style="font-family:Georgia,'Times New Roman',serif;color:#f6efe2;font-size:20px;letter-spacing:3px;">رقيم</div>
            </td>
          </tr>`
    : "";

  const bookCardRow =
    design.showBookCard && (coverUrl || bookTitle)
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6efe2;border-radius:12px;border:1px solid #f1e9da;margin-bottom:16px;">
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
                          <p style="margin:6px 0 0;color:${inkColor};font-size:19px;font-weight:700;font-family:Georgia,'Times New Roman',serif;">
                            ${escapeHtml(bookTitle ?? "إصدار رقيم")}
                          </p>
                        </td>
                      </tr>
                    </table>`
      : "";

  const orderInfoBlock = design.showOrderInfo
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f1e9da;border-radius:10px;">
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #f1e9da;">
                    <table role="presentation" width="100%"><tr>
                      <td style="color:#8a7d70;font-size:12.5px;">رقم الطلب</td>
                      <td align="left" dir="ltr" style="color:${inkColor};font-size:12.5px;font-weight:700;">${escapeHtml(orderId)}</td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #f1e9da;">
                    <table role="presentation" width="100%"><tr>
                      <td style="color:#8a7d70;font-size:12.5px;">الحد الأقصى للتحميلات</td>
                      <td align="left" dir="ltr" style="color:${inkColor};font-size:12.5px;font-weight:700;">${escapeHtml(maxDownloadsLabel)}</td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;">
                    <table role="presentation" width="100%"><tr>
                      <td style="color:#8a7d70;font-size:12.5px;">تنتهي الصلاحية</td>
                      <td align="left" style="color:${inkColor};font-size:12.5px;font-weight:700;">${escapeHtml(expiryLabel)}</td>
                    </tr></table>
                  </td>
                </tr>
              </table>`
    : "";

  const bookOrOrderInfoRow =
    bookCardRow || orderInfoBlock
      ? `
          <!-- Book / order info -->
          <tr>
            <td class="raqim-px" style="padding:8px 40px 20px;font-family:Tahoma,Arial,sans-serif;">
              ${bookCardRow}
              ${orderInfoBlock}
            </td>
          </tr>`
      : "";

  const noticeRow = design.showSecurityNotice
    ? `
          <!-- Notice -->
          <tr>
            <td class="raqim-px" style="padding:0 40px 36px;font-family:Tahoma,Arial,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${backgroundColor};border-radius:10px;border:1px dashed #e3d5b8;">
                <tr>
                  <td style="padding:16px 18px;color:#8a7d70;font-size:12px;line-height:2;">
                    هذا الرابط شخصي وخاص بحسابك — يرجى عدم مشاركته مع أحد. الرابط محدود بعدد مرات التحميل وتاريخ الصلاحية الموضحين أعلاه، وسيتوقف عن العمل بعدهما.
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
    : "";

  const footerRow = design.showBrandFooterBar
    ? `
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:${inkColor};padding:26px 24px;font-family:Tahoma,Arial,sans-serif;">
              <p style="margin:0 0 8px;color:#cfae6d;font-size:13px;font-family:Georgia,serif;letter-spacing:1px;">رقيم</p>
              <p style="margin:0 0 6px;color:#cbbfae;font-size:12px;">
                لأي استفسار: <a href="mailto:${SUPPORT_EMAIL}" style="color:#cfae6d;text-decoration:none;">${SUPPORT_EMAIL}</a>
              </p>
              <p style="margin:0;color:#8a7d70;font-size:11px;">© ${year} رقيم — ${SITE_URL.replace("https://", "")}. جميع الحقوق محفوظة.</p>
            </td>
          </tr>`
    : "";

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
<body style="margin:0;padding:0;background-color:${backgroundColor};" dir="rtl">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${backgroundColor};">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" class="raqim-container" width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;background-color:#ffffff;border-radius:14px;border:1px solid #f1e9da;overflow:hidden;">
${headerRow}

          <!-- Admin-editable content (hero, message, CTA, footer note) -->
          ${contentRows}
${bookOrOrderInfoRow}
${noticeRow}
${footerRow}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

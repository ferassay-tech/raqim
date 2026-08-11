import type { TemplateSection } from "../types/section";

/** Minimal escaping — every field rendered below is free-text typed by an
 * admin and interpolated directly into an HTML string, used both in the
 * preview modal (via dangerouslySetInnerHTML) and as the real sent email's
 * body — required for correctness in both cases, not an added layer. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Raqim brand tokens (index.css's @theme), copied as literal hex values —
 * this output is used both inside the admin's own React preview (already
 * has Tailwind) and inside a raw HTML email (never runs Tailwind, needs
 * real values either way), so a literal copy here is correct in both
 * places rather than a dependency either one would have to resolve. */
const COLOR = {
  gold: "#b99451",
  ink: "#2c2420",
  inkSoft: "#5c5147",
  inkFaint: "#8a7d70",
  beigeDashed: "#e3d5b8",
};

/**
 * Restores the premium, table-based "bulletproof email" structure this
 * template originally had (see git history — api/send-download-email.ts
 * before the Communication Templates module replaced it with a plain
 * renderer) — real RTL, real brand colors/typography, no reliance on
 * flexbox/grid/<style> (Outlook's renderer ignores both).
 *
 * Returns `<tr>` rows only, not a full `<table>` — the caller (the admin
 * preview modal, or api/send-download-email.ts for the real send) supplies
 * the surrounding table/card and, for the real email, the order-specific
 * chrome (brand header/footer bars, the real order-info card) that this
 * admin-editable content alone has no access to.
 */
function renderSection(section: TemplateSection): string {
  switch (section.type) {
    case "header":
      return `
        <tr>
          <td align="center" style="padding:40px 40px 16px;font-family:Tahoma,Arial,sans-serif;">
            <p style="margin:0 0 10px;color:${COLOR.gold};font-size:12px;letter-spacing:3px;text-transform:uppercase;">جاهز للتحميل</p>
            <h1 style="margin:0 0 ${section.fields.subtitle ? "10px" : "0"};color:${COLOR.ink};font-size:26px;line-height:1.4;font-weight:700;font-family:Georgia,'Times New Roman',serif;">${escapeHtml(section.fields.title)}</h1>
            ${
              section.fields.subtitle
                ? `<p style="margin:0;font-size:14px;color:${COLOR.inkSoft};">${escapeHtml(section.fields.subtitle)}</p>`
                : ""
            }
          </td>
        </tr>`;
    case "body":
      return `
        <tr>
          <td style="padding:4px 40px 24px;font-family:Tahoma,Arial,sans-serif;">
            <p style="margin:0;font-size:15px;line-height:1.9;color:${COLOR.inkSoft};white-space:pre-wrap;">${escapeHtml(
              section.fields.richText
            )}</p>
          </td>
        </tr>`;
    case "button":
      return `
        <tr>
          <td align="center" style="padding:0 40px 28px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="border-radius:10px;background-color:${COLOR.gold};">
                  <a href="${escapeHtml(section.fields.url)}" target="_blank" style="display:inline-block;padding:16px 44px;color:${COLOR.ink};font-family:Tahoma,Arial,sans-serif;font-size:15.5px;font-weight:700;text-decoration:none;">${escapeHtml(
                    section.fields.label
                  )}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    case "footer":
      return `
        <tr>
          <td style="padding:16px 40px 8px;border-top:1px dashed ${COLOR.beigeDashed};font-family:Tahoma,Arial,sans-serif;">
            <p style="margin:0;font-size:12px;line-height:1.9;color:${COLOR.inkFaint};text-align:center;">${escapeHtml(
              section.fields.text
            )}</p>
          </td>
        </tr>`;
  }
}

export function renderTemplateToHtml(sections: TemplateSection[]): string {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  return sorted.map(renderSection).join("");
}

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

function renderSection(section: TemplateSection): string {
  switch (section.type) {
    case "header":
      return `
        <div style="padding:24px 24px 12px;text-align:center;">
          <h1 style="margin:0;font-size:22px;color:#222;">${escapeHtml(section.fields.title)}</h1>
          ${
            section.fields.subtitle
              ? `<p style="margin:8px 0 0;font-size:14px;color:#666;">${escapeHtml(section.fields.subtitle)}</p>`
              : ""
          }
        </div>`;
    case "body":
      return `
        <div style="padding:12px 24px;">
          <p style="margin:0;font-size:15px;line-height:1.7;color:#333;white-space:pre-wrap;">${escapeHtml(
            section.fields.richText
          )}</p>
        </div>`;
    case "button":
      return `
        <div style="padding:20px 24px;text-align:center;">
          <a href="${escapeHtml(section.fields.url)}" style="display:inline-block;padding:12px 28px;background:#2c2420;color:#fff;text-decoration:none;border-radius:999px;font-size:14px;">${escapeHtml(
            section.fields.label
          )}</a>
        </div>`;
    case "footer":
      return `
        <div style="padding:16px 24px;border-top:1px solid #eee;text-align:center;">
          <p style="margin:0;font-size:12px;color:#999;">${escapeHtml(section.fields.text)}</p>
        </div>`;
  }
}

/**
 * TemplateSection[] → an HTML string. No plugin system, no per-type
 * registry — a plain switch is all four current section types need. Used
 * by both the admin-only preview modal and the real Download Email send
 * (OrderDownloadsCard); no email-client compatibility work (MSO/Outlook
 * conditionals, table-based layout, etc.) has been done here.
 */
export function renderTemplateToHtml(sections: TemplateSection[]): string {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const body = sorted.map(renderSection).join("");
  return `<div style="max-width:600px;margin:0 auto;background:#fff;font-family:Arial,sans-serif;">${body}</div>`;
}

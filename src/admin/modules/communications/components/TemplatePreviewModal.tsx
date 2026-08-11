import { useState } from "react";
import type { TemplateSection } from "../types/section";
import type { DownloadEmailDesignSettings } from "../types/template";
import { renderTemplateToHtml } from "../utils/renderTemplateToHtml";
import { buildDownloadEmailDocument } from "@/emails/downloadEmailDocument";
import { DOWNLOAD_EMAIL_TEMPLATE_ID } from "@/admin/data/communicationTemplatesData";
import { Modal } from "@/admin/components/ui/Modal";

interface TemplatePreviewModalProps {
  open: boolean;
  onClose: () => void;
  sections: TemplateSection[];
  /** The owning template's `id`. Gating the full-chrome preview on this
   * (matching the exact signal OrderDownloadsCard.tsx already uses to
   * resolve "the" download-link template for the real send —
   * DOWNLOAD_EMAIL_TEMPLATE_ID, not a `type` string) rather than on
   * `template.type` — `type` is persisted, mutable admin-editable state
   * that can drift (e.g. a template ever saved while `type` held a stale
   * or blank value, since new templates default to `type: ""`), which
   * would silently fall through to the generic preview with no error.
   * `id` never changes after creation. */
  templateId: string;
  /** The template's persisted design settings (Phase A — preview-only; the
   * real sent email still uses api/send-download-email.ts's own hardcoded
   * defaults until a separate, explicitly-approved Phase B wires this
   * through to production sending). `null` for any non-download-link
   * template — the generic branch below never reads this prop. */
  designSettings: DownloadEmailDesignSettings | null;
}

// Unmistakably fake — an admin previewing must never confuse this for a
// real customer's order. The CTA points nowhere real ("#") rather than to
// any live download route or token.
const DEMO_ORDER_ID = "ORD-DEMO-001";
const DEMO_BOOK_TITLE = "كوني هاجر";
const DEMO_MAX_DOWNLOADS = 3;
const DEMO_DOWNLOAD_URL = "#";
const DEMO_EXPIRY_DAYS_FROM_NOW = 30;

/** View-only — no editing, no sending. Re-renders from the live `sections`
 * prop every time it's opened, so it always reflects whatever was last
 * saved by the Content area's section CRUD.
 *
 * renderTemplateToHtml() returns only the admin-editable content rows
 * (hero/message/button/footer note) — the same rows the real email uses.
 * For the download-link template, those rows are wrapped with the same
 * premium chrome (brand header/footer, book card, order-info table,
 * security notice) the real sent email has, via
 * buildDownloadEmailDocument() (src/emails/downloadEmailDocument.ts) — the
 * canonical, src/-side copy of api/send-download-email.ts's chrome, kept in
 * sync with it by hand (see that file's own comment). Demo order/book data
 * fills in what only a real order would otherwise provide. Rendered in an
 * <iframe> because buildDownloadEmailDocument() returns a full HTML
 * document (<html>/<head>/<body>), which can't be injected into a <div>.
 *
 * Every other template keeps the lighter, chrome-less preview this modal
 * always had — a fake order card on a "welcome" or "marketing" template
 * would misrepresent what that email actually looks like. */
export function TemplatePreviewModal({ open, onClose, sections, templateId, designSettings }: TemplatePreviewModalProps) {
  // The full document (header + content + CTA + book card + order info +
  // notice + footer) is comfortably taller than any fixed guess — an
  // iframe with a fixed height clips everything past that height into its
  // own, easy-to-miss internal scrollbar, which is what made the book
  // card/order info/notice/footer look "missing" even though
  // buildDownloadEmailDocument() always includes them. Measuring the real
  // rendered height on load and resizing the iframe to match makes the
  // Modal's own scroll the only one that exists.
  const [iframeHeight, setIframeHeight] = useState(600);

  if (sections.length === 0) {
    return (
      <Modal open={open} onClose={onClose} title="معاينة القالب" size="lg">
        <p className="py-10 text-center text-sm text-ink-faint">لا يوجد محتوى بعد لمعاينته.</p>
      </Modal>
    );
  }

  if (templateId === DOWNLOAD_EMAIL_TEMPLATE_ID) {
    const sectionsWithDemoLink = sections.map((s) =>
      s.type === "button" ? { ...s, fields: { ...s.fields, url: DEMO_DOWNLOAD_URL } } : s
    );
    const contentRows = renderTemplateToHtml(sectionsWithDemoLink, {
      accentColor: designSettings?.accentColor,
      inkColor: designSettings?.inkColor,
    });
    const expiresAt = new Date(Date.now() + DEMO_EXPIRY_DAYS_FROM_NOW * 24 * 60 * 60 * 1000).toISOString();
    const fullHtml = buildDownloadEmailDocument({
      orderId: DEMO_ORDER_ID,
      contentRows,
      bookTitle: DEMO_BOOK_TITLE,
      bookCoverUrl: null,
      maxDownloads: DEMO_MAX_DOWNLOADS,
      expiresAt,
      design: designSettings ?? undefined,
    });

    return (
      <Modal open={open} onClose={onClose} title="معاينة القالب" size="lg">
        <p className="mb-3 text-xs text-ink-faint">
          معاينة تقريبية للبريد الفعلي — تستخدم بيانات تجريبية (رقم الطلب، الكتاب، الحدود) لأن هذه المعاينة لا ترتبط بطلب حقيقي.
        </p>
        <div className="overflow-hidden rounded-lg border border-beige">
          <iframe
            title="معاينة البريد الإلكتروني"
            srcDoc={fullHtml}
            onLoad={(e) => {
              const doc = e.currentTarget.contentWindow?.document;
              if (doc) setIframeHeight(doc.documentElement.scrollHeight);
            }}
            style={{ width: "100%", height: `${iframeHeight}px`, border: "none", display: "block" }}
          />
        </div>
      </Modal>
    );
  }

  const rows = renderTemplateToHtml(sections);
  const html = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fbf6ed;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" dir="rtl"
            style="max-width:600px;width:100%;background-color:#ffffff;border-radius:14px;border:1px solid #f1e9da;overflow:hidden;">
            ${rows}
          </table>
        </td>
      </tr>
    </table>`;

  return (
    <Modal open={open} onClose={onClose} title="معاينة القالب" size="lg">
      <div className="overflow-hidden rounded-lg border border-beige">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </Modal>
  );
}

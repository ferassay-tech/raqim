import type { TemplateSection } from "../types/section";
import { renderTemplateToHtml } from "../utils/renderTemplateToHtml";
import { Modal } from "@/admin/components/ui/Modal";

interface TemplatePreviewModalProps {
  open: boolean;
  onClose: () => void;
  sections: TemplateSection[];
}

/** View-only — no editing, no sending, no iframe. Re-renders from the live
 * `sections` prop every time it's opened, so it always reflects whatever
 * was last saved by the Content area's section CRUD.
 *
 * renderTemplateToHtml() returns only the admin-editable content rows
 * (hero/message/button/footer note) — this wraps them in the same ivory
 * page + centered white card composition the real sent email uses, so the
 * preview reads as the actual premium design. The real email additionally
 * wraps this same content with order-specific chrome (brand header/footer
 * bars, the real order-info card) that this preview has no order to
 * source real values from — see api/send-download-email.ts. */
export function TemplatePreviewModal({ open, onClose, sections }: TemplatePreviewModalProps) {
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
      {sections.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-faint">لا يوجد محتوى بعد لمعاينته.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-beige">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )}
    </Modal>
  );
}

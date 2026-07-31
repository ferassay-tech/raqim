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
 * was last saved by the Content area's section CRUD. */
export function TemplatePreviewModal({ open, onClose, sections }: TemplatePreviewModalProps) {
  const html = renderTemplateToHtml(sections);

  return (
    <Modal open={open} onClose={onClose} title="معاينة القالب" size="lg">
      {sections.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-faint">لا يوجد محتوى بعد لمعاينته.</p>
      ) : (
        <div className="rounded-lg border border-beige bg-white p-2">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )}
    </Modal>
  );
}

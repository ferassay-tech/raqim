import { Modal } from "./Modal";
import { IconAlertTriangle } from "../icons";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "neutral";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  tone = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-beige"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
              tone === "danger"
                ? "bg-danger text-ivory hover:bg-danger/90"
                : "bg-ink text-ivory hover:bg-gold-deep"
            }`}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3.5">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
            tone === "danger" ? "bg-danger/10 text-danger" : "bg-gold/10 text-gold-deep"
          }`}
        >
          <IconAlertTriangle className="h-5 w-5" />
        </span>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{description}</p>
      </div>
    </Modal>
  );
}

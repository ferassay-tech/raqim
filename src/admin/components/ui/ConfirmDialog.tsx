import { Modal } from "./Modal";
import { Button } from "./Button";
import { IconAlertTriangle } from "@/admin/icons";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "neutral";
  onConfirm: () => void;
  onCancel: () => void;
  /** While true, confirm shows a loading spinner and both actions, the
   * header close button, Escape, and backdrop click are disabled — for an
   * async confirmation action in flight. */
  busy?: boolean;
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
  busy = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      busy={busy}
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-full px-5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-beige disabled:pointer-events-none disabled:opacity-30"
          >
            {cancelLabel}
          </button>
          <Button
            variant="primary"
            onClick={onConfirm}
            loading={busy}
            className={`!px-5 ${tone === "danger" ? "!bg-danger hover:!bg-danger/90" : ""}`}
          >
            {confirmLabel}
          </Button>
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

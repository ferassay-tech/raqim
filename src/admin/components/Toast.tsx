import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconAlertTriangle, IconCheck, IconClose } from "../icons";

export type ToastVariant = "success" | "error";

export interface ToastState {
  variant: ToastVariant;
  message: string;
}

interface ToastProps {
  toast: ToastState | null;
  onDismiss: () => void;
  /** ms before auto-dismissing — set to 0 to require manual close. */
  duration?: number;
}

/**
 * Minimal, fixed-position toast — this app had no shared toast system
 * before (CopyIconButton's own comment notes lighter actions didn't need
 * one); this exists for exactly the class of action that does: an
 * async, fallible, no-other-feedback operation like sending an email.
 */
export function Toast({ toast, onDismiss, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (!toast || duration === 0) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [toast, duration, onDismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto flex items-center gap-3 rounded-full border px-5 py-3.5 shadow-[0_20px_45px_-15px_rgba(44,36,32,0.35)] backdrop-blur ${
              toast.variant === "success"
                ? "border-gold/40 bg-ink text-ivory"
                : "border-danger/40 bg-danger text-ivory"
            }`}
            role="status"
            aria-live="polite"
          >
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                toast.variant === "success" ? "bg-gold text-ink" : "bg-white/20 text-ivory"
              }`}
            >
              {toast.variant === "success" ? (
                <IconCheck className="h-3.5 w-3.5" />
              ) : (
                <IconAlertTriangle className="h-3.5 w-3.5" />
              )}
            </span>
            <p className="text-sm">{toast.message}</p>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="إغلاق"
              className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-ivory/70 transition-colors hover:text-ivory"
            >
              <IconClose className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

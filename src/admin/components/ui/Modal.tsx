import { useRef } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { IconClose } from "@/admin/icons";
import { useDialogA11y } from "@/admin/lib/useDialogA11y";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_CLASS: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-3xl",
  xl: "max-w-[1100px]",
};

export function Modal({ open, onClose, title, children, footer, size = "sm" }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogA11y(panelRef, open, onClose);
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 12, scale: reduceMotion ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 8, scale: reduceMotion ? 1 : 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`relative flex w-full flex-col overflow-hidden rounded-[10px] border border-beige bg-ivory shadow-[0_30px_70px_-20px_rgba(44,36,32,0.45)] ${SIZE_CLASS[size]}`}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-beige px-6 py-4">
              <h2 className="font-display text-lg text-ink">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق"
                className="grid h-8 w-8 place-items-center rounded-full text-ink-faint transition-colors hover:bg-cream hover:text-ink"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <div className="flex shrink-0 items-center justify-end gap-3 border-t border-beige bg-cream/40 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

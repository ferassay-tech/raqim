import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode, RefObject } from "react";
import { EASE_ARRIVAL } from "@/lib/motionEasing";

interface SlideOverShellProps {
  open: boolean;
  onClose: () => void;
  panelRef: RefObject<HTMLDivElement | null>;
  ariaLabel: string;
  /** Extra classes on the outer fixed wrapper (e.g. `lg:hidden`). */
  wrapperClassName?: string;
  backdropClassName: string;
  backdropDuration: number;
  backdropEase?: "easeOut";
  panelClassName: string;
  panelDuration: number;
  children: ReactNode;
}

/**
 * Shared backdrop + right-edge sliding-panel motion mechanics for `Drawer`
 * and `AdminMobileDrawer` — the one thing genuinely duplicated between them
 * (Phase 6 investigation). Owns only the `AnimatePresence`/motion behavior
 * and the reduced-motion gating; each consumer keeps its own panel content,
 * sizing, and backdrop styling exactly as before. Admin-internal only —
 * not a public-site primitive.
 */
export function SlideOverShell({
  open,
  onClose,
  panelRef,
  ariaLabel,
  wrapperClassName = "",
  backdropClassName,
  backdropDuration,
  backdropEase,
  panelClassName,
  panelDuration,
  children,
}: SlideOverShellProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <div className={`fixed inset-0 z-50 ${wrapperClassName}`.trim()}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : backdropDuration, ease: backdropEase }}
            className={backdropClassName}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            initial={{ x: reduceMotion ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: reduceMotion ? 0 : "100%" }}
            transition={{ duration: reduceMotion ? 0 : panelDuration, ease: EASE_ARRIVAL }}
            className={panelClassName}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

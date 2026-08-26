import { useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AdminSidebar } from "./AdminSidebar";
import { IconClose } from "@/admin/icons";
import { useDialogA11y } from "@/admin/lib/useDialogA11y";

interface AdminMobileDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Forwarded to AdminSidebar — called when the user taps the nav item for
   * the route they're already exactly on, so the drawer still closes even
   * though no navigation (and thus no route-change-driven close) occurs. */
  onSameRouteSelect?: () => void;
}

/** Off-canvas nav for < lg. Slides in from the physical right edge, matching
 * the sidebar's position in the desktop RTL layout. Reuses the same
 * useDialogA11y hook Modal/Drawer already use (focus trap, initial focus,
 * focus restoration, Escape-to-close) — this is a separate implementation
 * from the shared Drawer component (it renders AdminSidebar directly, no
 * title/footer slot) but gets the identical keyboard/focus behavior. */
export function AdminMobileDrawer({ open, onClose, onSameRouteSelect }: AdminMobileDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogA11y(panelRef, open, onClose);
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="القائمة"
            initial={{ x: reduceMotion ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: reduceMotion ? 0 : "100%" }}
            transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-y-0 right-0 w-[84%] max-w-xs shadow-[0_0_60px_rgba(0,0,0,0.35)]"
          >
            <div className="relative h-full">
              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق القائمة"
                className="absolute left-4 top-6 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/20"
              >
                <IconClose className="h-4 w-4" />
              </button>
              <AdminSidebar
                collapsed={false}
                onToggleCollapsed={() => {}}
                variant="drawer"
                onSameRouteSelect={onSameRouteSelect}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

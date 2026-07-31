import { AnimatePresence, motion } from "motion/react";
import { AdminSidebar } from "./AdminSidebar";
import { IconClose } from "@/admin/icons";

interface AdminMobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

/** Off-canvas nav for < lg. Slides in from the physical right edge, matching
 * the sidebar's position in the desktop RTL layout. */
export function AdminMobileDrawer({ open, onClose }: AdminMobileDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
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
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

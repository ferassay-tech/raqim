import { useRef } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { IconClose } from "@/admin/icons";
import { useDialogA11y } from "@/admin/lib/useDialogA11y";
import { SlideOverShell } from "../ui/SlideOverShell";

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
 * title/footer slot) but shares the same underlying slide-over motion
 * mechanics via SlideOverShell. */
export function AdminMobileDrawer({ open, onClose, onSameRouteSelect }: AdminMobileDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogA11y(panelRef, open, onClose);

  return (
    <SlideOverShell
      open={open}
      onClose={onClose}
      panelRef={panelRef}
      ariaLabel="القائمة"
      wrapperClassName="lg:hidden"
      backdropClassName="absolute inset-0 bg-ink/50 backdrop-blur-sm"
      backdropDuration={0.25}
      backdropEase="easeOut"
      panelClassName="absolute inset-y-0 right-0 w-[84%] max-w-xs shadow-[0_0_60px_rgba(0,0,0,0.35)]"
      panelDuration={0.32}
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
    </SlideOverShell>
  );
}

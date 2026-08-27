import { useRef } from "react";
import type { ReactNode } from "react";
import { IconClose } from "@/admin/icons";
import { useDialogA11y } from "@/admin/lib/useDialogA11y";
import { SlideOverShell } from "./SlideOverShell";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Slide-over panel from the physical right edge (matches the admin
 * sidebar's side). Used for read-only previews — Book preview, and future
 * quick-look use cases — so the record stays in context instead of a full
 * page navigation. */
export function Drawer({ open, onClose, title, children, footer }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogA11y(panelRef, open, onClose);

  return (
    <SlideOverShell
      open={open}
      onClose={onClose}
      panelRef={panelRef}
      ariaLabel={title}
      backdropClassName="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      backdropDuration={0.22}
      panelClassName="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-s border-beige bg-ivory shadow-[0_0_60px_rgba(0,0,0,0.25)]"
      panelDuration={0.32}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-beige px-6 py-5">
        <h2 className="font-display text-h2 text-ink">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-faint transition-colors hover:bg-cream hover:text-ink"
        >
          <IconClose className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      {footer && (
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-beige bg-cream/40 px-6 py-4">
          {footer}
        </div>
      )}
    </SlideOverShell>
  );
}

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { IconChevronStart } from "@/admin/icons";

type PanelWeight = "primary" | "secondary" | "flat";

const WEIGHT_SURFACE: Record<PanelWeight, string> = {
  // Level 1 — the one interactive, decision-worthy object on a screen.
  primary: "rounded-md border border-beige bg-white/70 p-6 shadow-(--shadow-soft) backdrop-blur",
  // Level 2 — a primary workspace: real architectural presence (a defined
  // area, a border, a quiet background) without the elevation that would
  // make it compete with Level 1. Whiter than the page canvas so it still
  // reads as a distinct surface, but a lower opacity than Level 1 so it
  // stays clearly the quieter of the two.
  secondary: "rounded-md border border-beige bg-white/60 p-6",
  // Level 3 — pure contextual information: spacing and dividers only.
  flat: "",
};

interface PanelProps {
  /** Omit when a section-level label (e.g. a page's own WorkspaceHeader)
   * already announces this panel — avoids repeating the same idea twice
   * before the panel's actual content appears. */
  title?: string;
  viewAllTo?: string;
  viewAllLabel?: string;
  children: ReactNode;
  className?: string;
  /** How much visual weight this panel deserves — not whether it has a
   * border, but how architecturally present it should feel. */
  weight?: PanelWeight;
}

/** Shared card shell — originally built for the Dashboard, now the
 * canonical bordered-card primitive for the whole admin. Keeps the header
 * (title + "view all") identical everywhere instead of each detail-page
 * card hand-rolling its own wrapper and h2. */
export function Panel({
  title,
  viewAllTo,
  viewAllLabel = "عرض الكل",
  children,
  className = "",
  weight = "primary",
}: PanelProps) {
  const hasHeader = Boolean(title || viewAllTo);

  return (
    <div className={`${WEIGHT_SURFACE[weight]} ${className}`.trim()}>
      {hasHeader && (
        <div className="flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-h2 text-ink">{title}</h2>}
          {viewAllTo && (
            <Link
              to={viewAllTo}
              className="group inline-flex items-center gap-1 text-xs text-gold-deep transition-colors hover:text-gold"
            >
              {viewAllLabel}
              <IconChevronStart className="h-3 w-3 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </Link>
          )}
        </div>
      )}
      <div className={hasHeader ? "mt-5" : ""}>{children}</div>
    </div>
  );
}

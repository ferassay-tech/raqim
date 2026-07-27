import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { IconChevronStart } from "../../icons";

interface DashboardPanelProps {
  title: string;
  viewAllTo?: string;
  viewAllLabel?: string;
  children: ReactNode;
  className?: string;
}

/** Shared card shell for every dashboard content panel — keeps the header
 * (title + "view all") identical across Orders/Messages/Activity/Best-seller
 * instead of four slightly different implementations. */
export function DashboardPanel({
  title,
  viewAllTo,
  viewAllLabel = "عرض الكل",
  children,
  className = "",
}: DashboardPanelProps) {
  return (
    <div
      className={`rounded-[10px] border border-beige bg-white/70 p-6 shadow-(--shadow-soft) backdrop-blur ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg text-ink">{title}</h2>
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
      <div className="mt-5">{children}</div>
    </div>
  );
}

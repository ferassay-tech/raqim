import type { FC } from "react";

interface StatCardProps {
  icon: FC<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
}

/** Compact label+value stat for detail-page headers — distinct from
 * MetricCard, which carries a trend and an optional chart for the Dashboard.
 * A customer's "favorite category" has no trend to show; forcing it into
 * MetricCard's shape would be a worse fit than a smaller, purpose-built card. */
export function StatCard({ icon: Icon, label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-md border border-beige bg-white/70 p-5 backdrop-blur">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-beige text-gold-deep">
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-xs uppercase tracking-[0.15em] text-ink-faint">{label}</p>
      </div>
      <p className="mt-3 truncate font-display text-2xl text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

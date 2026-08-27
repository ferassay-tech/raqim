import type { ReactNode, FC } from "react";

interface EmptyStateProps {
  icon: FC<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}

/** For real "nothing here" states within a built page — no results, empty
 * inbox, empty catalog. Distinct from AdminPagePlaceholder, which marks
 * pages that aren't built yet. */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-beige/70 text-gold-deep">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="font-display text-h2 text-ink">{title}</p>
        {description && (
          <p className="mx-auto mt-1.5 max-w-sm text-balance text-sm leading-relaxed text-ink-soft">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

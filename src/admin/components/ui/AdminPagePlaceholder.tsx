import type { ReactNode } from "react";
import type { FC } from "react";

interface AdminPagePlaceholderProps {
  title: string;
  description: string;
  icon: FC<{ className?: string }>;
  actions?: ReactNode;
}

/**
 * Temporary stand-in body for every /admin route in Milestone 2A — routing,
 * layout and navigation are real; page content ships milestone by milestone
 * (2B onward) in this same file, so no route/file restructuring is needed
 * later.
 */
export function AdminPagePlaceholder({
  title,
  description,
  icon: Icon,
  actions,
}: AdminPagePlaceholderProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 rounded-md border border-dashed border-beige bg-white/50 px-6 py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-beige/70 text-gold-deep">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-balance leading-loose text-ink-soft">
          {description}
        </p>
      </div>
      {actions}
      <span className="mt-2 rounded-full bg-cream px-3 py-1 text-[11px] tracking-wide text-ink-faint">
        قيد الإنشاء — سيتم بناء هذه الصفحة في مرحلة لاحقة
      </span>
    </div>
  );
}

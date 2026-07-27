import type { ReactNode } from "react";

export type TimelineTone = "default" | "success" | "warning" | "danger";

export interface TimelineEntry {
  id: string;
  title: ReactNode;
  time: string;
  tone?: TimelineTone;
}

interface TimelineProps {
  items: TimelineEntry[];
}

const DOT_TONE_CLASS: Record<TimelineTone, string> = {
  default: "border-gold bg-ivory",
  success: "border-success bg-success",
  warning: "border-warning bg-warning",
  danger: "border-danger bg-danger",
};

/** Shared vertical timeline — order status history, admin activity feed,
 * and any future audit trail all render through this one component. */
export function Timeline({ items }: TimelineProps) {
  return (
    <ol className="flex flex-col">
      {items.map((item, i) => (
        <li key={item.id} className="relative flex gap-3.5 pb-5 last:pb-0">
          {i !== items.length - 1 && (
            <span className="absolute start-[5.5px] top-3 h-full w-px bg-beige" />
          )}
          <span
            className={`relative mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 ${DOT_TONE_CLASS[item.tone ?? "default"]}`}
          />
          <div className="min-w-0 flex-1 pb-0.5">
            <p className="text-sm leading-relaxed text-ink-soft">{item.title}</p>
            <p className="mt-1 text-xs text-ink-faint">{item.time}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

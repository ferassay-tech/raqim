import type { ReactNode } from "react";

export type StatusBadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

const VARIANT_CLASSES: Record<StatusBadgeVariant, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-gold/10 text-gold-deep",
  neutral: "bg-beige text-ink-soft",
};

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  children: ReactNode;
}

export function StatusBadge({ variant, children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${VARIANT_CLASSES[variant]}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      {children}
    </span>
  );
}

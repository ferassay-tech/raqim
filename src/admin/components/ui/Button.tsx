import { forwardRef, type ButtonHTMLAttributes, type ComponentType } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ComponentType<{ className?: string }>;
}

/**
 * Shape Engine (RAQIM-DESIGN-ENGINE.md §4): the pill radius is reserved for
 * the primary action — everything else uses the card radius instead, so
 * pill shape stays a meaningful signal rather than a default.
 */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "rounded-full bg-ink text-ivory hover:bg-gold-deep",
  secondary: "rounded-md border border-beige bg-transparent text-ink hover:bg-cream",
  danger: "rounded-md border border-transparent text-danger hover:bg-danger/10",
  ghost: "rounded-md border border-transparent text-ink-soft hover:bg-cream",
};

const SPINNER_CLASSES: Record<ButtonVariant, string> = {
  primary: "border-ivory/60 border-t-transparent",
  secondary: "border-ink/40 border-t-transparent",
  danger: "border-danger/50 border-t-transparent",
  ghost: "border-ink-soft/50 border-t-transparent",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "gap-1.5 px-3 py-1.5 text-xs",
  md: "gap-1.5 px-4 py-2.5 text-sm",
  lg: "gap-2 px-6 py-3 text-sm",
};

/** Shared button — one component for the primary/secondary/danger/ghost
 * pills currently hand-duplicated across the admin and public site. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    icon: Icon,
    disabled,
    className = "",
    children,
    type = "button",
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`inline-flex shrink-0 items-center justify-center font-medium transition-colors disabled:pointer-events-none disabled:opacity-30 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden
          className={`h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 ${SPINNER_CLASSES[variant]}`}
        />
      ) : (
        Icon && <Icon className="h-4 w-4 shrink-0" />
      )}
      {children}
    </button>
  );
});

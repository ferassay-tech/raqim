import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

/**
 * Bespoke CTA garment set — per design-brief.md, zero shared button style.
 * Each intent gets its own component + interaction identity.
 */

/** Primary buy CTA — gold-foil stamp; :active depresses like a wax seal pressing. */
export function StampCTA({
  to,
  href,
  children,
  className = "",
}: {
  to?: string;
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  const { localizePath } = useLanguage();
  const classes = `group relative inline-flex items-center gap-3 rounded-md bg-gold px-8 py-4 text-base font-medium text-ink shadow-[0_10px_30px_-12px_rgba(185,148,81,0.55)] transition-all duration-200 ease-out hover:bg-gold-deep hover:shadow-[0_14px_34px_-10px_rgba(156,122,60,0.6)] active:translate-y-[2px] active:scale-[0.98] active:skew-x-[0.5deg] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${className}`;

  const inner = (
    <>
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="relative z-10 transition-transform duration-300 ltr:group-hover:translate-x-[4px] rtl:group-hover:translate-x-[-4px]"
      >
        <span className="rtl:hidden">→</span>
        <span className="ltr:hidden">←</span>
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-md opacity-0 mix-blend-overlay transition-opacity duration-200 group-active:opacity-100"
        style={{
          backgroundImage:
            "repeating-linear-gradient(120deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 3px)",
        }}
      />
    </>
  );

  if (to) {
    return (
      <Link to={localizePath(to)} className={classes}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={href} className={classes}>
      {inner}
    </a>
  );
}

/** Inline reading link — hand-drawn gold underline draws in on hover. Used once, in reading/nav contexts. */
export function UnderlineLink({
  to,
  children,
  className = "",
  interactive = true,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  /** Set false when this sits inside another interactive element (e.g. a
   * card that's already one big <Link>) — renders a <span> instead of a
   * nested <a>, keeping the exact same look and its own hover-triggered
   * underline animation, without invalid nested-anchor markup. The
   * ancestor element is expected to already handle the click/navigation. */
  interactive?: boolean;
}) {
  const { localizePath } = useLanguage();
  const classes = `group relative inline-flex items-center gap-2 text-gold focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep ${className}`;

  const inner = (
    <>
      <span className="relative">
        {children}
        <svg
          viewBox="0 0 100 8"
          preserveAspectRatio="none"
          className="absolute -bottom-1 left-0 h-2 w-full"
          aria-hidden
        >
          <path
            d="M1 5c15-3 70-3 98 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="origin-right scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="0"
          />
        </svg>
      </span>
      <span className="transition-transform duration-300 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
        <span className="rtl:hidden">→</span>
        <span className="ltr:hidden">←</span>
      </span>
    </>
  );

  if (!interactive) {
    return <span className={classes}>{inner}</span>;
  }

  return (
    <Link to={localizePath(to)} className={classes}>
      {inner}
    </Link>
  );
}

/** Guarantee band CTA — oversized numeral as the hit area, label as its caption. */
export function NumeralCTA({
  numeral,
  label,
  to,
}: {
  numeral: string;
  label: string;
  to: string;
}) {
  const { localizePath } = useLanguage();
  return (
    <Link to={localizePath(to)} className="group inline-flex flex-col items-start gap-2">
      <span className="font-logotype text-[5rem] leading-none text-gold transition-transform duration-300 group-hover:-translate-y-1 sm:text-[7rem]">
        {numeral}
      </span>
      <span className="text-sm text-ink-soft underline decoration-gold/40 decoration-1 underline-offset-4 transition-colors group-hover:text-ink">
        {label}
      </span>
    </Link>
  );
}


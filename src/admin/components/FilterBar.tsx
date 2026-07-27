import type { ReactNode } from "react";
import { IconChevronDown } from "../icons";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  ariaLabel: string;
}

/** Native <select> styled to match the design system — accessible and
 * cheap, no custom listbox needed for a handful of filter options. */
export function FilterSelect({ value, onChange, options, ariaLabel }: FilterSelectProps) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-full border border-beige bg-white/70 py-2.5 pe-9 ps-4 text-sm text-ink focus:border-gold focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <IconChevronDown className="pointer-events-none absolute inset-y-0 end-3 my-auto h-3.5 w-3.5 text-ink-faint" />
    </div>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

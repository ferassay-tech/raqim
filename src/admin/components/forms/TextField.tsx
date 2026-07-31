import type { ReactNode } from "react";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  suffix?: ReactNode;
  dir?: "rtl" | "ltr";
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  hint,
  suffix,
  dir,
}: TextFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          dir={dir}
          className="w-full rounded-[10px] border border-beige bg-ivory px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 start-3.5 my-auto text-xs text-ink-faint">
            {suffix}
          </span>
        )}
      </div>
      {hint && <span className="mt-1.5 block text-xs text-ink-faint">{hint}</span>}
    </label>
  );
}

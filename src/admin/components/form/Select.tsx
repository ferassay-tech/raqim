import { IconChevronDown } from "../../icons";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  required?: boolean;
}

export function Select({ label, value, onChange, options, required }: SelectProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full appearance-none rounded-[10px] border border-beige bg-ivory px-4 py-3 pe-10 text-sm text-ink focus:border-gold focus:outline-none"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <IconChevronDown className="pointer-events-none absolute inset-y-0 end-3.5 my-auto h-3.5 w-3.5 text-ink-faint" />
      </div>
    </label>
  );
}

interface SegmentedOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SegmentedControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SegmentedOption[];
}

export function SegmentedControl({ label, value, onChange, options }: SegmentedControlProps) {
  return (
    <div>
      <span className="mb-2 block text-sm text-ink">{label}</span>
      <div className="inline-flex rounded-full border border-beige bg-ivory p-1">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={opt.disabled}
              onClick={() => onChange(opt.value)}
              className={`rounded-full px-4 py-2 text-sm transition-colors disabled:pointer-events-none disabled:opacity-40 ${
                active ? "bg-ink text-ivory" : "text-ink-soft hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

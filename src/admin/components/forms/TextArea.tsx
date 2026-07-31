interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
}

export function TextArea({ label, value, onChange, rows = 4, placeholder, hint, maxLength }: TextAreaProps) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm text-ink">{label}</span>
        {maxLength && (
          <span className="text-xs text-ink-faint">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full resize-none rounded-[10px] border border-beige bg-ivory px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
      />
      {hint && <span className="mt-1.5 block text-xs text-ink-faint">{hint}</span>}
    </label>
  );
}

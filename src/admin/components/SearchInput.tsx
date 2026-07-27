import { IconSearch } from "../icons";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className = "" }: SearchInputProps) {
  return (
    <label className={`relative block ${className}`}>
      <IconSearch className="pointer-events-none absolute inset-y-0 right-3.5 my-auto h-4 w-4 text-ink-faint" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-beige bg-white/70 py-2.5 pe-10 ps-4 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
      />
    </label>
  );
}

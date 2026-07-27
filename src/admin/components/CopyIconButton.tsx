import { useState } from "react";
import { IconCheck, IconCopy } from "../icons";

interface CopyIconButtonProps {
  value: string;
  label?: string;
  className?: string;
}

/** Small copy-to-clipboard affordance — icon swaps to a check for ~1.5s as
 * the only feedback needed, no toast required for such a light action. */
export function CopyIconButton({ value, label = "نسخ", className = "" }: CopyIconButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard permission denied — silently ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      title={label}
      className={`grid h-7 w-7 place-items-center rounded-full text-ink-faint transition-colors hover:bg-cream hover:text-ink ${className}`}
    >
      {copied ? <IconCheck className="h-3.5 w-3.5 text-success" /> : <IconCopy className="h-3.5 w-3.5" />}
    </button>
  );
}

import React, { useState } from "react";
import { IconCopy, IconCheck } from "./icons";
import { useLanguage } from "../../context/LanguageContext";

interface CopyButtonProps {
  value: string;
  label?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ value, label }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label ? `${t("copyButton.copyAriaPrefix")}${label}` : t("copyButton.copyAria")}
      className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-white/70 px-3 py-1.5 text-xs font-medium text-gold-deep transition hover:bg-beige focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
    >
      {copied ? (
        <>
          <IconCheck className="h-3.5 w-3.5" />
          {t("copyButton.copied")}
        </>
      ) : (
        <>
          <IconCopy className="h-3.5 w-3.5" />
          {t("copyButton.copy")}
        </>
      )}
    </button>
  );
};

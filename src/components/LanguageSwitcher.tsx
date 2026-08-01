import { useLanguage } from "../context/LanguageContext";
import type { Language } from "../context/LanguageContext";

const OPTIONS: { code: Language; label: string }[] = [
  { code: "ar", label: "AR" },
  { code: "en", label: "EN" },
];

/**
 * "AR | EN" — no icon, no full language names, no flags. Each label sets
 * its language directly (not a toggle), the active one highlighted like
 * the rest of the nav's text links (ink vs. ink-soft). Always rendered
 * left-to-right (AR first) regardless of the page's current direction, so
 * it reads the same whether the site is in Arabic or English.
 */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("language.switcherLabel")}
      dir="ltr"
      className={`flex items-center gap-1.5 text-sm ${className}`}
    >
      {OPTIONS.map((option, index) => (
        <span key={option.code} className="flex items-center gap-1.5">
          {index > 0 && <span className="text-ink-faint">|</span>}
          <button
            type="button"
            onClick={() => setLanguage(option.code)}
            aria-current={language === option.code}
            className={`transition-colors duration-300 ${
              language === option.code ? "font-medium text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        </span>
      ))}
    </div>
  );
}

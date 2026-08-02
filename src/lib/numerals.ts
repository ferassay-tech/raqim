import type { Language } from "../context/LanguageContext";

const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function toLatinDigits(value: string): string {
  return value.replace(/[٠-٩]/g, (digit) => String(ARABIC_INDIC_DIGITS.indexOf(digit)));
}

/** Renders a count/ordinal with Latin digits in English and Arabic-Indic
 * digits in Arabic, regardless of whether the input is already a number
 * (e.g. book.pages) or a stored Arabic-Indic digit string (e.g. a chapter's
 * editorial "١" ordinal) — round-trips safely either way. */
export function formatNumeral(value: number | string, language: Language): string {
  const latin = typeof value === "number" ? String(value) : toLatinDigits(value);
  if (language === "en") return latin;
  return latin.replace(/[0-9]/g, (digit) => ARABIC_INDIC_DIGITS[Number(digit)]);
}

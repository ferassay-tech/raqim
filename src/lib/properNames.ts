import type { Language } from "../context/LanguageContext";

/** A small, fixed set of brand/author proper nouns that get a real English
 * transliteration in English mode — everything else (e.g. a future admin
 * or author's real name) passes through unchanged, since most names aren't
 * meant to be "translated" at all. Arabic mode always shows the original
 * Arabic name, regardless of this table. */
const PROPER_NAME_TRANSLATIONS: Record<string, string> = {
  "رقيم": "Raqim",
  "مها نصر": "Maha Nasar",
};

export function localizeProperName(name: string, language: Language): string {
  if (language !== "en") return name;
  return PROPER_NAME_TRANSLATIONS[name] ?? name;
}

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { AdminCategory, AdminCategoryRaw } from "../types/category";
import type { LocalizedText } from "../types/siteContent";
import { INITIAL_CATEGORIES } from "../data/categoriesData";
import { createCollectionAdapter } from "../services/data";
import { readLocalCollectionSnapshot } from "../services/data/localAdapter";
import { useLanguage } from "../../context/LanguageContext";
import type { Language } from "../../context/LanguageContext";

// The CMS Foundation's generic Data Layer engine (Phase 1), local backend
// only — same storage key ("categories") usePersistedState used, so this
// reads the exact same existing data with no migration step. Categories is
// the first module to actually consume the engine; every other Context
// (Books, Articles, Settings, Media, ...) is untouched by this phase.
const CATEGORIES_STORAGE_KEY = "categories";

interface CategoriesContextValue {
  /** Resolved for the active site language — public pages and the Admin
   * category list/select controls consume this, unchanged shape. */
  categories: AdminCategory[];
  /** Raw, bilingual — Category editor, and any consumer that needs the
   * stable Arabic match key directly (Book editor's category select). */
  rawCategories: AdminCategoryRaw[];
  /** Stable, language-independent name for matching/filtering/counting
   * against AdminBook.category (which stores this exact Arabic string) —
   * never the resolved display name, which varies by active language. */
  getCategoryMatchName: (id: string) => string;
  /** The reverse of getCategoryMatchName — takes the raw Arabic string
   * stored on a book (AdminBook.category) and returns the resolved display
   * name for the active language, so a book card can show a localized
   * category label without AdminBook.category itself ever changing (it
   * stays the stable Arabic matching key). Falls back to the raw string
   * unchanged when no category matches it — e.g. the "قريبًا" placeholder
   * value used by coming-soon books, which isn't a real category. */
  getCategoryLabel: (rawCategoryName: string) => string;
  createCategory: (values: Omit<AdminCategoryRaw, "id">) => void;
  updateCategory: (id: string, values: Omit<AdminCategoryRaw, "id">) => void;
  deleteCategory: (id: string) => void;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

const FALLBACK_LANGUAGE: Language = "ar";

function resolveText(value: LocalizedText, language: Language): string {
  return value[language] || value[FALLBACK_LANGUAGE] || "";
}

// Older localStorage records (and the original seed data) stored these
// copy fields as plain strings. Wrapping any plain string into
// { ar: value, en: "" } on read means existing category data is never
// lost — this is a pure, idempotent transform, so already-migrated data
// just passes through unchanged. Mirrors the SiteContent/Books migration.
//
// `seedValue`, when given, self-heals a browser that already persisted this
// exact field from before an English translation was written for it — see
// BooksContext.tsx's migrateLocalizedText for the full rationale.
function migrateLocalizedText(value: unknown, seedValue?: LocalizedText): LocalizedText {
  const migrated: LocalizedText =
    typeof value === "string"
      ? { ar: value, en: "" }
      : value && typeof value === "object"
        ? { ar: (value as Partial<LocalizedText>).ar ?? "", en: (value as Partial<LocalizedText>).en ?? "" }
        : { ar: "", en: "" };
  if (!migrated.en && seedValue?.en) {
    return { ...migrated, en: seedValue.en };
  }
  return migrated;
}

function migrateCategory(raw: AdminCategoryRaw): AdminCategoryRaw {
  const seed = INITIAL_CATEGORIES.find((c) => c.id === raw.id);
  return {
    ...raw,
    name: migrateLocalizedText(raw.name, seed?.name),
    description: migrateLocalizedText(raw.description, seed?.description),
  };
}

function resolveCategory(raw: AdminCategoryRaw, language: Language): AdminCategory {
  return {
    id: raw.id,
    name: resolveText(raw.name, language),
    description: resolveText(raw.description, language),
  };
}

function slugify(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/(^-|-$)/g, "") || "category"
  );
}

/**
 * Books reference a category by its name string (AdminBook.category), not
 * an id — that's how the public catalog data already worked before this
 * milestone. Renaming a category here intentionally does not cascade to
 * existing books; a real backend would use category ids and handle that
 * referential update. Flagged in the Milestone 2F report, not hidden.
 *
 * Copy fields are stored bilingually ({ar, en}); `categories` resolves to
 * the active site language, falling back to Arabic when English is empty —
 * same contract as before this migration. Because AdminBook.category always
 * stores the raw Arabic name (Books was not converted), every consumer that
 * matches/counts/filters books by category must use getCategoryMatchName(id)
 * instead of the resolved `name` — see AdminCategoryRaw's doc comment.
 */
/** The plain-string placeholder value coming-soon books use for `category`
 * (never a real AdminCategory) — special-cased below so it still localizes
 * on cards even though it's not a real, admin-managed category. */
const COMING_SOON_CATEGORY_PLACEHOLDER = "قريبًا";

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const adapter = useRef(
    createCollectionAdapter<AdminCategoryRaw>("local", CATEGORIES_STORAGE_KEY, INITIAL_CATEGORIES)
  ).current;
  // Synchronous bootstrap so the first render shows real stored data
  // immediately — identical guarantee to the usePersistedState this
  // replaces; see localAdapter.ts's readLocalCollectionSnapshot doc comment
  // for why a synchronous read is needed even though the engine is async.
  const [storedCategories, setStoredCategories] = useState<AdminCategoryRaw[]>(() =>
    readLocalCollectionSnapshot(CATEGORIES_STORAGE_KEY, INITIAL_CATEGORIES)
  );
  const { language, t } = useLanguage();

  const rawCategories = useMemo(() => storedCategories.map(migrateCategory), [storedCategories]);
  const categories = useMemo(() => rawCategories.map((c) => resolveCategory(c, language)), [rawCategories, language]);

  const getCategoryMatchName = useCallback(
    (id: string) => rawCategories.find((c) => c.id === id)?.name.ar ?? "",
    [rawCategories]
  );

  const getCategoryLabel = useCallback(
    (rawCategoryName: string) => {
      if (rawCategoryName === COMING_SOON_CATEGORY_PLACEHOLDER) return t("home.booksGrid.comingSoon");
      const match = rawCategories.find((c) => c.name.ar === rawCategoryName);
      return match ? resolveText(match.name, language) : rawCategoryName;
    },
    [rawCategories, language, t]
  );

  const createCategory = useCallback(
    (values: Omit<AdminCategoryRaw, "id">) => {
      let id = slugify(values.name.ar);
      let n = 2;
      while (storedCategories.some((c) => c.id === id)) {
        id = `${slugify(values.name.ar)}-${n}`;
        n += 1;
      }
      const row: AdminCategoryRaw = { id, ...values };
      void adapter.create(row).then(() => {
        setStoredCategories((prev) => [...prev, row]);
      });
    },
    [adapter, storedCategories]
  );

  const updateCategory = useCallback(
    (id: string, values: Omit<AdminCategoryRaw, "id">) => {
      void adapter.update(id, values).then((updated) => {
        setStoredCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      });
    },
    [adapter]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      void adapter.remove(id).then(() => {
        setStoredCategories((prev) => prev.filter((c) => c.id !== id));
      });
    },
    [adapter]
  );

  const value = useMemo(
    () => ({
      categories,
      rawCategories,
      getCategoryMatchName,
      getCategoryLabel,
      createCategory,
      updateCategory,
      deleteCategory,
    }),
    [categories, rawCategories, getCategoryMatchName, getCategoryLabel, createCategory, updateCategory, deleteCategory]
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error("useCategories must be used within CategoriesProvider");
  return ctx;
}

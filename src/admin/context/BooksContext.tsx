import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { AdminBook, AdminBookRaw, BookStatus } from "../types/book";
import type { LocalizedText } from "../types/siteContent";
import { INITIAL_BOOKS } from "../data/booksData";
import { usePersistedState } from "../lib/usePersistedState";
import { useLanguage } from "../../context/LanguageContext";
import type { Language } from "../../context/LanguageContext";

interface BooksContextValue {
  /** Resolved for the active site language — public pages, checkout,
   * structured data, and every other Admin module (dashboard, customers,
   * media, categories, downloads) all consume this, unchanged shape. */
  books: AdminBook[];
  getBook: (id: string) => AdminBook | undefined;
  /** Raw, bilingual — Book Editor only. */
  getRawBook: (id: string) => AdminBookRaw | undefined;
  createBook: (book: Omit<AdminBookRaw, "id" | "updatedAt" | "sales">) => AdminBookRaw;
  updateBook: (id: string, patch: Partial<AdminBookRaw>) => void;
  /** Soft delete — sets deletedAt, hides the book from public site + default
   * Admin views, but keeps it recoverable from the "المحذوفة" trash view. */
  deleteBook: (id: string) => void;
  deleteBooks: (ids: string[]) => void;
  restoreBook: (id: string) => void;
  restoreBooks: (ids: string[]) => void;
  /** Actually removes the record — only ever called from the trash view. */
  permanentlyDeleteBook: (id: string) => void;
  duplicateBook: (id: string) => void;
  setBooksStatus: (ids: string[], status: BookStatus) => void;
}

const BooksContext = createContext<BooksContextValue | null>(null);

const today = () => new Date().toISOString().slice(0, 10);

const FALLBACK_LANGUAGE: Language = "ar";

function resolveText(value: LocalizedText, language: Language): string {
  return value[language] || value[FALLBACK_LANGUAGE] || "";
}

function slugify(title: string) {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/(^-|-$)/g, "") || "book"
  );
}

// Older localStorage records (and the original seed data) stored these
// copy fields as plain strings. Wrapping any plain string into
// { ar: value, en: "" } on read means existing catalog data is never lost —
// this is a pure, idempotent transform, so already-migrated data just
// passes through unchanged and no separate one-time migration step or
// version flag is needed. Mirrors the SiteContentContext migration exactly.
//
// `seedValue`, when given, self-heals a browser that already persisted this
// exact field from before an English translation was written for it: if the
// stored English is still empty AND the current seed now ships a real
// English value for the same book/field, adopt the seed's English text.
// Never touches Arabic, never overwrites an English value an admin actually
// typed — it only lets newly-authored translations reach browsers that
// already have the old, English-empty shape stored, with no manual reset.
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

function migrateBook(raw: AdminBookRaw): AdminBookRaw {
  const seed = INITIAL_BOOKS.find((b) => b.id === raw.id);
  return {
    ...raw,
    title: migrateLocalizedText(raw.title, seed?.title),
    subtitle: migrateLocalizedText(raw.subtitle, seed?.subtitle),
    authorBio: migrateLocalizedText(raw.authorBio, seed?.authorBio),
    description: migrateLocalizedText(raw.description, seed?.description),
    longDescription: migrateLocalizedText(raw.longDescription, seed?.longDescription),
    whoFor: (raw.whoFor ?? []).map((w, i) => migrateLocalizedText(w, seed?.whoFor?.[i])),
    features: (raw.features ?? []).map((f, i) => ({
      icon: f.icon,
      title: migrateLocalizedText(f.title, seed?.features?.[i]?.title),
      body: migrateLocalizedText(f.body, seed?.features?.[i]?.body),
    })),
    chapters: (raw.chapters ?? []).map((c, i) => ({
      number: c.number,
      title: migrateLocalizedText(c.title, seed?.chapters?.[i]?.title),
    })),
    reviews: (raw.reviews ?? []).map((r, i) => ({
      quote: migrateLocalizedText(r.quote, seed?.reviews?.[i]?.quote),
      name: migrateLocalizedText(r.name, seed?.reviews?.[i]?.name),
      role: migrateLocalizedText(r.role, seed?.reviews?.[i]?.role),
    })),
    faq: (raw.faq ?? []).map((f, i) => ({
      question: migrateLocalizedText(f.question, seed?.faq?.[i]?.question),
      answer: migrateLocalizedText(f.answer, seed?.faq?.[i]?.answer),
    })),
    ctaLabel: migrateLocalizedText(raw.ctaLabel, seed?.ctaLabel),
    badges: (raw.badges ?? []).map((b, i) => migrateLocalizedText(b, seed?.badges?.[i])),
    language: migrateLocalizedText(raw.language, seed?.language),
    format: migrateLocalizedText(raw.format, seed?.format),
    seoTitle: migrateLocalizedText(raw.seoTitle, seed?.seoTitle),
    seoDescription: migrateLocalizedText(raw.seoDescription, seed?.seoDescription),
  };
}

function resolveBook(raw: AdminBookRaw, language: Language): AdminBook {
  return {
    ...raw,
    title: resolveText(raw.title, language),
    subtitle: resolveText(raw.subtitle, language),
    authorBio: resolveText(raw.authorBio, language),
    description: resolveText(raw.description, language),
    longDescription: resolveText(raw.longDescription, language),
    whoFor: raw.whoFor.map((w) => resolveText(w, language)),
    features: raw.features.map((f) => ({
      icon: f.icon,
      title: resolveText(f.title, language),
      body: resolveText(f.body, language),
    })),
    chapters: raw.chapters.map((c) => ({ number: c.number, title: resolveText(c.title, language) })),
    reviews: raw.reviews.map((r) => ({
      quote: resolveText(r.quote, language),
      name: resolveText(r.name, language),
      role: resolveText(r.role, language),
    })),
    faq: raw.faq.map((f) => ({ question: resolveText(f.question, language), answer: resolveText(f.answer, language) })),
    ctaLabel: resolveText(raw.ctaLabel, language),
    badges: raw.badges.map((b) => resolveText(b, language)),
    language: resolveText(raw.language, language),
    format: resolveText(raw.format, language),
    seoTitle: resolveText(raw.seoTitle, language),
    seoDescription: resolveText(raw.seoDescription, language),
  };
}

/**
 * In-memory CRUD store for the admin book catalog — Milestone 2C is
 * frontend-only, so this stands in for what will later be an API layer.
 * Session-scoped only (resets on reload), but persists across route
 * navigation, so Create → List → Edit all reflect the same live data.
 *
 * Copy fields are stored bilingually ({ar, en}); `books`/`getBook()` resolve
 * to the active site language for every public/Admin-list consumer, falling
 * back to Arabic when English is empty — same contract as before this
 * migration. `getRawBook()`/`createBook()`/`updateBook()` operate on the raw
 * bilingual shape, for the Book Editor only.
 */
export function BooksProvider({ children }: { children: ReactNode }) {
  const [storedBooks, setBooks] = usePersistedState<AdminBookRaw[]>("books", INITIAL_BOOKS);
  const { language } = useLanguage();

  const rawBooks = useMemo(() => storedBooks.map(migrateBook), [storedBooks]);
  const books = useMemo(() => rawBooks.map((b) => resolveBook(b, language)), [rawBooks, language]);

  const getBook = useCallback((id: string) => books.find((b) => b.id === id), [books]);
  const getRawBook = useCallback((id: string) => rawBooks.find((b) => b.id === id), [rawBooks]);

  const createBook = useCallback(
    (book: Omit<AdminBookRaw, "id" | "updatedAt" | "sales">) => {
      let id = slugify(book.title.ar);
      let created!: AdminBookRaw;
      setBooks((prev) => {
        let candidate = id;
        let n = 2;
        while (prev.some((b) => b.id === candidate)) {
          candidate = `${id}-${n}`;
          n += 1;
        }
        id = candidate;
        created = { ...book, id, sales: 0, updatedAt: today() };
        return [created, ...prev];
      });
      return created;
    },
    [setBooks]
  );

  const updateBook = useCallback(
    (id: string, patch: Partial<AdminBookRaw>) => {
      setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch, updatedAt: today() } : b)));
    },
    [setBooks]
  );

  const deleteBook = useCallback((id: string) => {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, deletedAt: today() } : b)));
  }, [setBooks]);

  const deleteBooks = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setBooks((prev) => prev.map((b) => (idSet.has(b.id) ? { ...b, deletedAt: today() } : b)));
  }, [setBooks]);

  const restoreBook = useCallback((id: string) => {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, deletedAt: null } : b)));
  }, [setBooks]);

  const restoreBooks = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setBooks((prev) => prev.map((b) => (idSet.has(b.id) ? { ...b, deletedAt: null } : b)));
  }, [setBooks]);

  const permanentlyDeleteBook = useCallback((id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }, [setBooks]);

  const duplicateBook = useCallback((id: string) => {
    setBooks((prev) => {
      const source = prev.find((b) => b.id === id);
      if (!source) return prev;
      let dupId = `${source.id}-copy`;
      let n = 2;
      while (prev.some((b) => b.id === dupId)) {
        dupId = `${source.id}-copy-${n}`;
        n += 1;
      }
      const sourceTitle = migrateLocalizedText(source.title);
      const duplicate: AdminBookRaw = {
        ...source,
        id: dupId,
        title: {
          ar: `${sourceTitle.ar} (نسخة)`,
          en: sourceTitle.en ? `${sourceTitle.en} (copy)` : "",
        },
        status: "draft",
        placement: "hidden",
        sales: 0,
        deletedAt: null,
        updatedAt: today(),
      };
      const index = prev.findIndex((b) => b.id === id);
      return [...prev.slice(0, index + 1), duplicate, ...prev.slice(index + 1)];
    });
  }, [setBooks]);

  const setBooksStatus = useCallback((ids: string[], status: BookStatus) => {
    const idSet = new Set(ids);
    setBooks((prev) => prev.map((b) => (idSet.has(b.id) ? { ...b, status, updatedAt: today() } : b)));
  }, [setBooks]);

  const value = useMemo(
    () => ({
      books,
      getBook,
      getRawBook,
      createBook,
      updateBook,
      deleteBook,
      deleteBooks,
      restoreBook,
      restoreBooks,
      permanentlyDeleteBook,
      duplicateBook,
      setBooksStatus,
    }),
    [
      books,
      getBook,
      getRawBook,
      createBook,
      updateBook,
      deleteBook,
      deleteBooks,
      restoreBook,
      restoreBooks,
      permanentlyDeleteBook,
      duplicateBook,
      setBooksStatus,
    ]
  );

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
}

export function useBooks() {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error("useBooks must be used within BooksProvider");
  return ctx;
}

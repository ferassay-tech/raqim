import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { AdminBook, AdminBookRaw, BookStatus } from "../types/book";
import type { LocalizedText } from "../types/siteContent";
import { INITIAL_BOOKS } from "../data/booksData";
import { booksRepository, fromSupabaseRow, toSupabaseRow } from "./booksRepository.ts";
import { useLanguage } from "../../context/LanguageContext";
import type { Language } from "../../context/LanguageContext";

interface BooksContextValue {
  /** Resolved for the active site language — public pages and the Admin
   * all consume this, unchanged shape. */
  books: AdminBook[];
  getBook: (id: string) => AdminBook | undefined;
  /** Raw, bilingual — Book Editor only. */
  getRawBook: (id: string) => AdminBookRaw | undefined;
  createBook: (book: Omit<AdminBookRaw, "id" | "updatedAt" | "sales">) => Promise<void>;
  updateBook: (id: string, patch: Partial<AdminBookRaw>) => void;
  /** Soft delete — sets deletedAt, hides the book from public site + default
   * Admin views, but keeps it recoverable from the "المحذوفة" trash view. */
  deleteBook: (id: string) => void;
  deleteBooks: (ids: string[]) => void;
  restoreBook: (id: string) => void;
  restoreBooks: (ids: string[]) => void;
  /** Actually removes the record — only ever called from the trash view. */
  permanentlyDeleteBook: (id: string) => Promise<void>;
  duplicateBook: (id: string) => void;
  setBooksStatus: (ids: string[], status: BookStatus) => void;
  /** Set when the initial Supabase fetch fails; null once it succeeds. */
  loadError: string | null;
  /** Re-runs the initial fetch — the retry action behind loadError's banner. */
  reload: () => void;
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

// Kept from before this migration — a real, already-shipped browser could
// still hold a copy field as a plain string from before bilingual support
// existed. Harmless and idempotent against the now-always-correct shape
// Supabase rows come back in (see booksRepository.fromSupabaseRow).
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
      rating: r.rating ?? seed?.reviews?.[i]?.rating ?? 5,
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
      rating: r.rating,
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
 * CMS Phase 6A — Books, backed by the Supabase `books` table via the same
 * generic repository engine Categories already proved out. `category_id`
 * is never read or computed here — see booksRepository.ts's doc comment:
 * the display/matching category name lives in content.category and is
 * carried through on every write exactly as it already was, so an
 * existing row's category_id (set once, offline, by
 * generate-books-seed.mjs) is never touched by ordinary Admin edits.
 *
 * INITIAL_BOOKS is kept only as the synchronous render-time placeholder
 * shown before the first real fetch resolves (and as migrateBook's
 * legacy-shape reference) — not as a persistence fallback. No
 * localStorage read/write happens for this module anymore.
 */
export function BooksProvider({ children }: { children: ReactNode }) {
  const [storedBooks, setStoredBooks] = useState<AdminBookRaw[]>(INITIAL_BOOKS);
  // Every row as last fetched from Supabase, keyed by id — the only place
  // category_id (and any other column not surfaced on AdminBookRaw) is
  // remembered, so a write can carry it forward unchanged without ever
  // re-deriving it.
  const rowsById = useRef<Map<string, ReturnType<typeof toSupabaseRow>>>(new Map());
  const { language } = useLanguage();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    booksRepository
      .list()
      .then((rows) => {
        if (cancelled) return;
        rowsById.current = new Map(rows.map((row) => [row.id, row]));
        setStoredBooks(rows.map(fromSupabaseRow));
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load books from Supabase:", error);
        setLoadError("تعذر تحميل الكتب من الخادم.");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const rawBooks = useMemo(() => storedBooks.map(migrateBook), [storedBooks]);
  const books = useMemo(() => rawBooks.map((b) => resolveBook(b, language)), [rawBooks, language]);

  const getBook = useCallback((id: string) => books.find((b) => b.id === id), [books]);
  const getRawBook = useCallback((id: string) => rawBooks.find((b) => b.id === id), [rawBooks]);

  /** category_id for an existing row is whatever the last fetch saw;
   * brand new rows have none yet (see this file's top comment — nothing
   * here ever computes one). */
  const categoryIdFor = useCallback((id: string) => rowsById.current.get(id)?.category_id ?? null, []);

  const createBook = useCallback(async (book: Omit<AdminBookRaw, "id" | "updatedAt" | "sales">) => {
    let id = slugify(book.title.ar);
    let n = 2;
    while (storedBooks.some((b) => b.id === id)) {
      id = `${slugify(book.title.ar)}-${n}`;
      n += 1;
    }
    const created: AdminBookRaw = { ...book, id, sales: 0, updatedAt: today() };
    const row = toSupabaseRow(created, null);
    // Awaited (not fire-and-forget) so a genuine write failure rejects this
    // promise instead of being silently swallowed — the caller (BookNewPage)
    // now knows whether the book was actually created before navigating
    // away or showing a success message.
    await booksRepository.create(row);
    rowsById.current.set(id, row);
    setStoredBooks((prev) => [created, ...prev]);
  }, [storedBooks]);

  const persistPatch = useCallback(
    (id: string, patch: Partial<AdminBookRaw>) => {
      const current = storedBooks.find((b) => b.id === id);
      if (!current) return;
      const merged: AdminBookRaw = { ...current, ...patch, updatedAt: today() };
      const row = toSupabaseRow(merged, categoryIdFor(id));
      void booksRepository.update(id, row).then(() => {
        rowsById.current.set(id, row);
        setStoredBooks((prev) => prev.map((b) => (b.id === id ? merged : b)));
      });
    },
    [storedBooks, categoryIdFor]
  );

  const updateBook = useCallback(
    (id: string, patch: Partial<AdminBookRaw>) => persistPatch(id, patch),
    [persistPatch]
  );

  const deleteBook = useCallback((id: string) => persistPatch(id, { deletedAt: today() }), [persistPatch]);

  const deleteBooks = useCallback(
    (ids: string[]) => {
      ids.forEach((id) => persistPatch(id, { deletedAt: today() }));
    },
    [persistPatch]
  );

  const restoreBook = useCallback((id: string) => persistPatch(id, { deletedAt: null }), [persistPatch]);

  const restoreBooks = useCallback(
    (ids: string[]) => {
      ids.forEach((id) => persistPatch(id, { deletedAt: null }));
    },
    [persistPatch]
  );

  const permanentlyDeleteBook = useCallback(async (id: string) => {
    await booksRepository.remove(id);
    rowsById.current.delete(id);
    setStoredBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const duplicateBook = useCallback(
    (id: string) => {
      const source = storedBooks.find((b) => b.id === id);
      if (!source) return;
      let dupId = `${source.id}-copy`;
      let n = 2;
      while (storedBooks.some((b) => b.id === dupId)) {
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
      const row = toSupabaseRow(duplicate, null);
      void booksRepository.create(row).then(() => {
        rowsById.current.set(dupId, row);
        setStoredBooks((prev) => {
          const index = prev.findIndex((b) => b.id === id);
          return [...prev.slice(0, index + 1), duplicate, ...prev.slice(index + 1)];
        });
      });
    },
    [storedBooks]
  );

  const setBooksStatus = useCallback(
    (ids: string[], status: BookStatus) => {
      ids.forEach((id) => persistPatch(id, { status }));
    },
    [persistPatch]
  );

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
      loadError,
      reload,
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
      loadError,
      reload,
    ]
  );

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
}

export function useBooks() {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error("useBooks must be used within BooksProvider");
  return ctx;
}

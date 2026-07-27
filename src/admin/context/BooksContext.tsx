import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { AdminBook, BookStatus } from "../types/book";
import { INITIAL_BOOKS } from "../data/booksData";
import { usePersistedState } from "../lib/usePersistedState";

interface BooksContextValue {
  books: AdminBook[];
  getBook: (id: string) => AdminBook | undefined;
  createBook: (book: Omit<AdminBook, "id" | "updatedAt" | "sales">) => AdminBook;
  updateBook: (id: string, patch: Partial<AdminBook>) => void;
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

function slugify(title: string) {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/(^-|-$)/g, "") || "book"
  );
}

/**
 * In-memory CRUD store for the admin book catalog — Milestone 2C is
 * frontend-only, so this stands in for what will later be an API layer.
 * Session-scoped only (resets on reload), but persists across route
 * navigation, so Create → List → Edit all reflect the same live data.
 */
export function BooksProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = usePersistedState<AdminBook[]>("books", INITIAL_BOOKS);

  const getBook = useCallback((id: string) => books.find((b) => b.id === id), [books]);

  const createBook = useCallback((book: Omit<AdminBook, "id" | "updatedAt" | "sales">) => {
    let id = slugify(book.title);
    setBooks((prev) => {
      let candidate = id;
      let n = 2;
      while (prev.some((b) => b.id === candidate)) {
        candidate = `${id}-${n}`;
        n += 1;
      }
      id = candidate;
      const newBook: AdminBook = { ...book, id, sales: 0, updatedAt: today() };
      return [newBook, ...prev];
    });
    return { ...book, id, sales: 0, updatedAt: today() };
  }, [setBooks]);

  const updateBook = useCallback((id: string, patch: Partial<AdminBook>) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch, updatedAt: today() } : b))
    );
  }, [setBooks]);

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
      const duplicate: AdminBook = {
        ...source,
        id: dupId,
        title: `${source.title} (نسخة)`,
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
    setBooks((prev) =>
      prev.map((b) => (idSet.has(b.id) ? { ...b, status, updatedAt: today() } : b))
    );
  }, [setBooks]);

  const value = useMemo(
    () => ({
      books,
      getBook,
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

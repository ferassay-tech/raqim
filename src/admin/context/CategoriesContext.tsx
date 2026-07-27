import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { AdminCategory } from "../types/category";
import { INITIAL_CATEGORIES } from "../data/categoriesData";
import { usePersistedState } from "../lib/usePersistedState";

interface CategoriesContextValue {
  categories: AdminCategory[];
  createCategory: (values: Omit<AdminCategory, "id">) => void;
  updateCategory: (id: string, values: Omit<AdminCategory, "id">) => void;
  deleteCategory: (id: string) => void;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

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
 */
export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = usePersistedState<AdminCategory[]>("categories", INITIAL_CATEGORIES);

  const createCategory = useCallback((values: Omit<AdminCategory, "id">) => {
    setCategories((prev) => {
      let id = slugify(values.name);
      let n = 2;
      while (prev.some((c) => c.id === id)) {
        id = `${slugify(values.name)}-${n}`;
        n += 1;
      }
      return [...prev, { id, ...values }];
    });
  }, [setCategories]);

  const updateCategory = useCallback((id: string, values: Omit<AdminCategory, "id">) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { id, ...values } : c)));
  }, [setCategories]);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, [setCategories]);

  const value = useMemo(
    () => ({ categories, createCategory, updateCategory, deleteCategory }),
    [categories, createCategory, updateCategory, deleteCategory]
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error("useCategories must be used within CategoriesProvider");
  return ctx;
}

import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { CommunicationCategory } from "../modules/communications/types/category";
import { INITIAL_COMMUNICATION_CATEGORIES } from "../data/communicationCategoriesData";
import { usePersistedState } from "../lib/usePersistedState";

interface CommunicationCategoriesContextValue {
  categories: CommunicationCategory[];
  createCategory: (values: Omit<CommunicationCategory, "id">) => void;
  updateCategory: (id: string, values: Omit<CommunicationCategory, "id">) => void;
  deleteCategory: (id: string) => void;
}

const CommunicationCategoriesContext = createContext<CommunicationCategoriesContextValue | null>(null);

export function CommunicationCategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = usePersistedState<CommunicationCategory[]>(
    "communicationCategories",
    INITIAL_COMMUNICATION_CATEGORIES
  );

  const createCategory = useCallback(
    (values: Omit<CommunicationCategory, "id">) => {
      setCategories((prev) => [...prev, { id: crypto.randomUUID(), ...values }]);
    },
    [setCategories]
  );

  const updateCategory = useCallback(
    (id: string, values: Omit<CommunicationCategory, "id">) => {
      setCategories((prev) => prev.map((c) => (c.id === id ? { id, ...values } : c)));
    },
    [setCategories]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    },
    [setCategories]
  );

  const value = useMemo(
    () => ({ categories, createCategory, updateCategory, deleteCategory }),
    [categories, createCategory, updateCategory, deleteCategory]
  );

  return (
    <CommunicationCategoriesContext.Provider value={value}>
      {children}
    </CommunicationCategoriesContext.Provider>
  );
}

export function useCommunicationCategories() {
  const ctx = useContext(CommunicationCategoriesContext);
  if (!ctx) throw new Error("useCommunicationCategories must be used within CommunicationCategoriesProvider");
  return ctx;
}

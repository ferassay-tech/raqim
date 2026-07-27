import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { usePersistedState } from "../lib/usePersistedState";

export interface CustomerNote {
  id: string;
  text: string;
  time: string;
}

interface CustomerNotesContextValue {
  notesFor: (customerId: string) => CustomerNote[];
  addNote: (customerId: string, text: string) => void;
}

const CustomerNotesContext = createContext<CustomerNotesContextValue | null>(null);

/**
 * Deliberately separate from Orders/Books state: notes are the one piece of
 * customer data that genuinely belongs to the customer record itself, not
 * something derivable from order history. Kept as its own small store so
 * deriveCustomers() never has to know notes exist.
 */
export function CustomerNotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = usePersistedState<Record<string, CustomerNote[]>>("customer_notes", {});

  const notesFor = useCallback((customerId: string) => notes[customerId] ?? [], [notes]);

  const addNote = useCallback((customerId: string, text: string) => {
    const time = new Intl.DateTimeFormat("ar", {
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "numeric",
    }).format(new Date());
    setNotes((prev) => ({
      ...prev,
      [customerId]: [...(prev[customerId] ?? []), { id: `${customerId}-n${Date.now()}`, text, time }],
    }));
  }, [setNotes]);

  const value = useMemo(() => ({ notesFor, addNote }), [notesFor, addNote]);

  return <CustomerNotesContext.Provider value={value}>{children}</CustomerNotesContext.Provider>;
}

export function useCustomerNotes() {
  const ctx = useContext(CustomerNotesContext);
  if (!ctx) throw new Error("useCustomerNotes must be used within CustomerNotesProvider");
  return ctx;
}

import type { ReactNode } from "react";
import { IconPlus, IconTrash } from "../../icons";

interface RepeaterProps<T> {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  renderItem: (item: T, update: (value: T) => void) => ReactNode;
  addLabel: string;
  emptyLabel: string;
}

/**
 * One generic add/remove list editor reused for every repeatable book-page
 * section (who-for, features, chapters, reviews, FAQ, badges) — each field
 * type just supplies its own row renderer instead of a new list component.
 */
export function Repeater<T>({ label, items, onChange, newItem, renderItem, addLabel, emptyLabel }: RepeaterProps<T>) {
  const updateAt = (index: number, value: T) => {
    onChange(items.map((item, i) => (i === index ? value : item)));
  };
  const removeAt = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <span className="mb-2 block text-sm text-ink">{label}</span>
      <div className="flex flex-col gap-3">
        {items.length === 0 && <p className="text-xs text-ink-faint">{emptyLabel}</p>}
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 rounded-[10px] border border-beige bg-ivory p-4">
            <div className="min-w-0 flex-1">{renderItem(item, (value) => updateAt(i, value))}</div>
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="حذف"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <IconTrash className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, newItem()])}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-dashed border-beige px-4 py-2 text-xs text-ink-soft transition-colors hover:border-gold hover:text-ink"
        >
          <IconPlus className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      </div>
    </div>
  );
}

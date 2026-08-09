import type { ReactNode } from "react";
import { IconChevronDown } from "@/admin/icons";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortAccessor?: (row: T) => string | number;
  className?: string;
  align?: "start" | "end" | "center";
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  onRowClick?: (row: T) => void;
  sortKey?: string | null;
  sortDirection?: "asc" | "desc";
  onSortChange?: (key: string) => void;
  emptyState?: ReactNode;
}

const ALIGN_CLASS: Record<"start" | "end" | "center", string> = {
  start: "text-start",
  end: "text-end",
  center: "text-center",
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  onRowClick,
  sortKey,
  sortDirection = "asc",
  onSortChange,
  emptyState,
}: DataTableProps<T>) {
  const allSelected = selectable && rows.length > 0 && rows.every((r) => selectedKeys?.has(rowKey(r)));
  const someSelected = selectable && rows.some((r) => selectedKeys?.has(rowKey(r))) && !allSelected;

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(rows.map(rowKey)));
    }
  };

  const toggleRow = (key: string) => {
    if (!onSelectionChange || !selectedKeys) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  };

  if (rows.length === 0 && emptyState) {
    return <div className="rounded-md border border-beige bg-white/70">{emptyState}</div>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-beige bg-white/70">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-beige">
            {selectable && (
              <th className="w-12 px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  aria-label="تحديد الكل"
                  className="h-4 w-4 rounded border-beige accent-gold-deep"
                />
              </th>
            )}
            {columns.map((col) => {
              const isSortable = Boolean(col.sortAccessor);
              const isActive = sortKey === col.key;
              return (
                <th
                  key={col.key}
                  className={`px-4 py-3.5 text-xs font-medium uppercase tracking-wide text-ink-faint ${
                    ALIGN_CLASS[col.align ?? "start"]
                  } ${col.className ?? ""}`}
                >
                  {isSortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange?.(col.key)}
                      className={`group inline-flex items-center gap-1 transition-colors hover:text-ink ${
                        isActive ? "text-ink" : ""
                      }`}
                    >
                      {col.header}
                      <IconChevronDown
                        className={`h-3 w-3 transition-transform duration-200 ${
                          isActive && sortDirection === "asc" ? "rotate-180" : ""
                        } ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}
                      />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = rowKey(row);
            const isSelected = selectedKeys?.has(key) ?? false;
            return (
              <tr
                key={key}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-beige/70 last:border-0 transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                } ${isSelected ? "bg-cream/60" : "hover:bg-cream/40"}`}
              >
                {selectable && (
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(key)}
                      aria-label="تحديد الصف"
                      className="h-4 w-4 rounded border-beige accent-gold-deep"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 ${ALIGN_CLASS[col.align ?? "start"]} ${col.className ?? ""}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

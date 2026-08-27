import type { KeyboardEvent, ReactNode } from "react";
import { IconChevronDown } from "@/admin/icons";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortAccessor?: (row: T) => string | number;
  className?: string;
  align?: "start" | "end" | "center";
  /** Mobile card-view role (below the `md` breakpoint). Reuses this same
   * column's `render(row)` output — never a second, duplicated render path.
   * Omitted entirely on any consumer that declares no `mobileField` on any
   * column, which keeps the existing table-only behavior byte-for-byte.
   * A column with no `mobileField` set is simply not shown in card mode. */
  mobileField?: "title" | "subtitle" | "meta" | "status" | "value" | "actions" | "hidden";
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

  // Keyboard equivalent of the row's onClick. Guarded to the row itself
  // (event.target === event.currentTarget) so Enter/Space pressed while
  // focus is on a nested checkbox or action button — each already
  // independently focusable and already handles its own activation — never
  // also triggers row navigation. Shared by both the desktop <tr> and the
  // mobile card <div> below.
  const handleRowKeyDown = (event: KeyboardEvent<HTMLElement>, row: T) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRowClick?.(row);
    }
  };

  if (rows.length === 0 && emptyState) {
    return <div className="rounded-md border border-beige bg-white/70">{emptyState}</div>;
  }

  // Mobile card view only activates when a consumer explicitly opts in by
  // tagging at least one column — every other DataTable consumer declares
  // no mobileField anywhere and falls straight through to the unchanged,
  // table-only markup below.
  const hasMobileFields = columns.some((c) => c.mobileField);
  const titleCol = columns.find((c) => c.mobileField === "title");
  const subtitleCol = columns.find((c) => c.mobileField === "subtitle");
  const statusCol = columns.find((c) => c.mobileField === "status");
  const valueCol = columns.find((c) => c.mobileField === "value");
  const actionsCol = columns.find((c) => c.mobileField === "actions");
  const metaCols = columns.filter((c) => c.mobileField === "meta");

  const table = (
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
                onKeyDown={onRowClick ? (e) => handleRowKeyDown(e, row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
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

  if (!hasMobileFields) {
    return table;
  }

  const cards = (
    <div className="flex flex-col gap-3 md:hidden">
      {rows.map((row) => {
        const key = rowKey(row);
        const isSelected = selectedKeys?.has(key) ?? false;
        return (
          <div
            key={key}
            onClick={() => onRowClick?.(row)}
            onKeyDown={onRowClick ? (e) => handleRowKeyDown(e, row) : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            role={onRowClick ? "button" : undefined}
            className={`flex flex-col gap-3 rounded-md border border-beige bg-white/70 p-4 transition-colors ${
              onRowClick ? "cursor-pointer" : ""
            } ${isSelected ? "bg-cream/60" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              {selectable && (
                <div onClick={(e) => e.stopPropagation()} className="shrink-0 pt-0.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleRow(key)}
                    aria-label="تحديد الصف"
                    className="h-4 w-4 rounded border-beige accent-gold-deep"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                {titleCol && <div>{titleCol.render(row)}</div>}
                {subtitleCol && <div className="mt-1">{subtitleCol.render(row)}</div>}
              </div>
              {statusCol && <div className="shrink-0">{statusCol.render(row)}</div>}
            </div>

            {metaCols.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
                {metaCols.map((col) => (
                  <div key={col.key}>{col.render(row)}</div>
                ))}
              </div>
            )}

            {(valueCol || actionsCol) && (
              <div className="flex items-center justify-between gap-3 border-t border-beige/70 pt-3">
                {valueCol ? <div className="text-sm font-medium text-ink">{valueCol.render(row)}</div> : <div />}
                {actionsCol && (
                  <div onClick={(e) => e.stopPropagation()}>{actionsCol.render(row)}</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="hidden md:block">{table}</div>
      {cards}
    </>
  );
}

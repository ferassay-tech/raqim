import { IconChevronStart } from "../icons";

interface PaginationProps {
  page: number;
  pageCount: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageCount, totalItems, pageSize, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between gap-4 border-t border-beige px-1 pt-4">
      <p className="text-xs text-ink-faint">
        عرض {start}–{end} من {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="الصفحة السابقة"
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-cream disabled:pointer-events-none disabled:opacity-30"
        >
          <IconChevronStart className="h-4 w-4 rotate-180" />
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`grid h-8 w-8 place-items-center rounded-lg text-xs transition-colors ${
              p === page ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          disabled={page === pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="الصفحة التالية"
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-cream disabled:pointer-events-none disabled:opacity-30"
        >
          <IconChevronStart className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

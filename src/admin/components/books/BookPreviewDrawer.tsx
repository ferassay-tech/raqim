import { Link } from "react-router-dom";
import type { AdminBook } from "../../types/book";
import { BOOK_STATUS_META, CURRENCY_SYMBOLS } from "../../types/book";
import { BOOK_PLACEMENT_META } from "../../lib/bookPlacement";
import { Drawer } from "../Drawer";
import { StatusBadge } from "../StatusBadge";
import { BookCoverThumb } from "./BookCoverThumb";
import { IconPencil } from "../../icons";

const STATUS_VARIANT = {
  published: "success",
  draft: "warning",
  archived: "neutral",
} as const;

interface BookPreviewDrawerProps {
  book: AdminBook | null;
  onClose: () => void;
}

export function BookPreviewDrawer({ book, onClose }: BookPreviewDrawerProps) {
  return (
    <Drawer
      open={Boolean(book)}
      onClose={onClose}
      title="معاينة الكتاب"
      footer={
        book && (
          <Link
            to={`/admin/books/edit/${book.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-deep"
          >
            <IconPencil className="h-4 w-4" />
            فتح للتعديل
          </Link>
        )
      }
    >
      {book && (
        <div className="flex flex-col gap-6">
          <div className="flex gap-4">
            <BookCoverThumb
              id={book.id}
              cover={book.cover}
              title={book.title}
              className="h-40 w-28 shrink-0 shadow-[0_15px_35px_-15px_rgba(44,36,32,0.45)]"
            />
            <div className="flex flex-col justify-center gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge variant={STATUS_VARIANT[book.status]}>{BOOK_STATUS_META[book.status]}</StatusBadge>
                <StatusBadge variant={BOOK_PLACEMENT_META[book.placement].variant}>
                  {BOOK_PLACEMENT_META[book.placement].label}
                </StatusBadge>
              </div>
              <h3 className="font-display text-xl leading-snug text-ink">{book.title}</h3>
              <p className="text-sm text-ink-soft">{book.author}</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-ink-soft">{book.subtitle}</p>

          <dl className="grid grid-cols-2 gap-4 rounded-[10px] border border-beige bg-cream/40 p-4 text-sm">
            <Detail label="التصنيف" value={book.category} />
            <Detail
              label="السعر"
              value={
                book.prices.USD
                  ? `${CURRENCY_SYMBOLS.USD}${book.prices.USD.price.toFixed(2)}`
                  : "—"
              }
            />
            <Detail label="المخزون" value={book.stock.toLocaleString("en-US")} />
            <Detail label="المبيعات" value={book.sales.toLocaleString("en-US")} />
            <Detail label="اللغة" value={book.language} />
            <Detail label="عدد الصفحات" value={book.pages.toLocaleString("en-US")} />
            <Detail label="الصيغة" value={book.format} />
            <Detail label="آخر تحديث" value={book.updatedAt} />
          </dl>

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.15em] text-ink-faint">الوصف</p>
            <p className="text-sm leading-relaxed text-ink-soft">
              {book.description || "لا يوجد وصف بعد."}
            </p>
          </div>
        </div>
      )}
    </Drawer>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-ink">{value}</dd>
    </div>
  );
}

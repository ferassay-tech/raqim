import type { BestSellingBook } from "../../types/dashboard";
import { DashboardPanel } from "./DashboardPanel";
import { EmptyState } from "../EmptyState";
import { BookCoverThumb } from "../books/BookCoverThumb";
import { IconBook } from "../../icons";

interface BestSellingBookPanelProps {
  book: BestSellingBook | null;
}

export function BestSellingBookPanel({ book }: BestSellingBookPanelProps) {
  if (!book) {
    return (
      <DashboardPanel title="الكتاب الأكثر مبيعًا" viewAllTo="/admin/books">
        <EmptyState
          icon={IconBook}
          title="لا توجد بيانات مبيعات بعد"
          description="سيظهر الكتاب الأكثر مبيعًا هنا بعد أول عملية شراء مكتملة."
        />
      </DashboardPanel>
    );
  }

  const sharePercent = Math.round(book.shareOfSales * 100);

  return (
    <DashboardPanel title="الكتاب الأكثر مبيعًا" viewAllTo="/admin/books">
      <div className="flex gap-4">
        <BookCoverThumb
          id={book.title}
          cover={book.cover}
          title={book.title}
          className="h-24 w-16 shrink-0 shadow-[0_10px_25px_-10px_rgba(44,36,32,0.45)]"
        />
        <div className="flex flex-1 flex-col justify-center">
          <p className="font-display text-base text-ink">{book.title}</p>
          <p className="mt-1 text-xs text-ink-faint">
            {book.unitsSold.toLocaleString("en-US")} نسخة · {book.revenue}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-ink-faint">
          <span>من إجمالي المبيعات</span>
          <span className="text-ink-soft">{sharePercent}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-beige">
          <div className="h-full rounded-full bg-gold" style={{ width: `${sharePercent}%` }} />
        </div>
      </div>
    </DashboardPanel>
  );
}

import { Link } from "react-router-dom";
import type { BestSellingBook, PublishingPipelineSummary } from "@/admin/types/dashboard";
import { Panel } from "@/admin/components/ui/Panel";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { BookCoverThumb } from "@/admin/modules/books/components/BookCoverThumb";
import { IconBook, IconCheck } from "@/admin/icons";

interface PublishingPanelProps {
  pipeline: PublishingPipelineSummary;
  book: BestSellingBook | null;
  bookCountLabel: string;
}

/**
 * Publishing & Catalog's one decision: is anything in the pipeline waiting
 * to be finished. The oldest open draft leads; the best-selling book stays
 * as secondary context below it — a sales fact, not a publishing decision.
 */
export function PublishingPanel({ pipeline, book, bookCountLabel }: PublishingPanelProps) {
  const { lead, remainingCount } = pipeline;
  const sharePercent = book ? Math.round(book.shareOfSales * 100) : 0;

  return (
    <Panel title="النشر والكتالوج" viewAllTo="/admin/books" weight="secondary">
      {lead ? (
        <Link
          to={lead.href}
          className="-mx-2 flex items-start gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-cream/50"
        >
          <IconBook className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-ink">{lead.title}</span>
            <span className="mt-1 block truncate text-xs text-ink-faint">
              أقدم مسودة قيد التحرير · آخر تعديل {lead.updatedAt}
            </span>
            {remainingCount > 0 && (
              <span className="mt-1 block text-xs text-ink-faint">
                و{remainingCount.toLocaleString("en-US")} مسودات أخرى بانتظار الإكمال
              </span>
            )}
          </span>
        </Link>
      ) : (
        <div className="flex items-center gap-3 py-1">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-success/10 text-success">
            <IconCheck className="h-4 w-4" />
          </span>
          <p className="text-sm text-ink-soft">لا توجد مسودات بانتظار الإكمال.</p>
        </div>
      )}

      <div className="mt-5 border-t border-beige pt-5">
        <p className="text-xs text-ink-faint">{bookCountLabel} كتاب في الكتالوج</p>

        {!book ? (
          <div className="mt-4">
            <EmptyState
              icon={IconBook}
              title="لا توجد بيانات مبيعات بعد"
              description="سيظهر الكتاب الأكثر مبيعًا هنا بعد أول عملية شراء مكتملة."
            />
          </div>
        ) : (
          <>
            <div className="mt-4 flex gap-4">
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
          </>
        )}
      </div>
    </Panel>
  );
}

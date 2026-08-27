import { Link } from "react-router-dom";
import type { AdminOrder } from "@/admin/types/order";
import { BookCoverThumb } from "@/admin/modules/books/components/BookCoverThumb";
import { formatCurrencyAmount } from "@/admin/lib/formatCurrencyGroups";

interface OrderItemsCardProps {
  order: AdminOrder;
}

export function OrderItemsCard({ order }: OrderItemsCardProps) {
  const subtotal = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = subtotal - order.discount;

  return (
    <div className="rounded-md border border-beige bg-white/70 p-6 shadow-(--shadow-soft) backdrop-blur">
      <h2 className="font-display text-h2 text-ink">عناصر الطلب</h2>

      <ul className="mt-5 flex flex-col divide-y divide-beige">
        {order.items.map((item) => (
          <li key={item.bookId} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
            <BookCoverThumb id={item.bookId} cover={item.cover} title={item.title} className="h-16 w-11 shrink-0" />
            <div className="min-w-0 flex-1">
              <Link
                to={`/admin/books/edit/${item.bookId}`}
                className="block truncate text-sm text-ink transition-colors hover:text-gold-deep"
              >
                {item.title}
              </Link>
              <p className="mt-0.5 text-xs text-ink-faint">
                {item.quantity} × {formatCurrencyAmount(order.currency, item.unitPrice)}
              </p>
            </div>
            <span className="shrink-0 text-sm text-ink-soft">
              {formatCurrencyAmount(order.currency, item.quantity * item.unitPrice)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-col gap-2 border-t border-beige pt-5 text-sm">
        <div className="flex items-center justify-between text-ink-soft">
          <span>المجموع الفرعي</span>
          <span>{formatCurrencyAmount(order.currency, subtotal)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex items-center justify-between text-ink-soft">
            <span>الخصم</span>
            <span>-{formatCurrencyAmount(order.currency, order.discount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1 text-base">
          <span className="font-display text-ink">الإجمالي</span>
          <span className="font-display text-ink">{formatCurrencyAmount(order.currency, total)}</span>
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import type { AdminOrder } from "@/admin/types/order";
import { BookCoverThumb } from "@/admin/modules/books/components/BookCoverThumb";

interface OrderItemsCardProps {
  order: AdminOrder;
}

export function OrderItemsCard({ order }: OrderItemsCardProps) {
  const subtotal = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = subtotal - order.discount;

  return (
    <div className="rounded-[10px] border border-beige bg-white/70 p-6 shadow-(--shadow-soft) backdrop-blur">
      <h2 className="font-display text-lg text-ink">عناصر الطلب</h2>

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
                {item.quantity} × ${item.unitPrice.toFixed(2)}
              </p>
            </div>
            <span className="shrink-0 text-sm text-ink-soft">
              ${(item.quantity * item.unitPrice).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-col gap-2 border-t border-beige pt-5 text-sm">
        <div className="flex items-center justify-between text-ink-soft">
          <span>المجموع الفرعي</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex items-center justify-between text-ink-soft">
            <span>الخصم</span>
            <span>-${order.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1 text-base">
          <span className="font-display text-ink">الإجمالي</span>
          <span className="font-display text-ink">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import type { AdminCustomer } from "@/admin/types/customer";
import { ORDER_TOTAL } from "@/admin/types/order";
import { ORDER_STATUS_META } from "@/admin/lib/orderStatus";
import { formatCurrencyAmount } from "@/admin/lib/formatCurrencyGroups";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";

interface CustomerOrderHistoryCardProps {
  customer: AdminCustomer;
}

export function CustomerOrderHistoryCard({ customer }: CustomerOrderHistoryCardProps) {
  return (
    <div className="rounded-[10px] border border-beige bg-white/70 p-6 shadow-(--shadow-soft) backdrop-blur">
      <h2 className="font-display text-lg text-ink">سجل الطلبات</h2>
      <ul className="mt-4 flex flex-col divide-y divide-beige">
        {customer.orders.map((order) => {
          const meta = ORDER_STATUS_META[order.status];
          return (
            <li key={order.id}>
              <Link
                to={`/admin/orders/${order.id}`}
                className="-mx-2 flex items-center justify-between gap-4 rounded-lg px-2 py-3.5 transition-colors first:pt-0 last:pb-0 hover:bg-cream/50"
              >
                <div className="min-w-0">
                  <p className="text-sm text-ink" dir="ltr">
                    #{order.id}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-faint">
                    {order.items[0].title}
                    {order.items.length > 1 ? ` +${order.items.length - 1}` : ""} · {order.createdAt}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm text-ink-soft">{formatCurrencyAmount(order.currency, ORDER_TOTAL(order))}</span>
                  <StatusBadge variant={meta.variant}>{meta.label}</StatusBadge>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

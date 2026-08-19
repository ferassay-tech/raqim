import { Link } from "react-router-dom";
import type { LatestOrder } from "@/admin/types/dashboard";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { ORDER_STATUS_META } from "@/admin/lib/orderStatus";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { Panel } from "@/admin/components/ui/Panel";
import { IconBag } from "@/admin/icons";

interface LatestOrdersPanelProps {
  orders: LatestOrder[];
}

export function LatestOrdersPanel({ orders }: LatestOrdersPanelProps) {
  if (orders.length === 0) {
    return (
      <Panel title="أحدث الطلبات" viewAllTo="/admin/orders" viewAllLabel="عرض كل الطلبات" weight="flat">
        <EmptyState icon={IconBag} title="لا توجد طلبات بعد" description="ستظهر أحدث الطلبات هنا فور ورودها." />
      </Panel>
    );
  }

  return (
    <Panel title="أحدث الطلبات" viewAllTo="/admin/orders" viewAllLabel="عرض كل الطلبات" weight="flat">
      <ul className="flex flex-col divide-y divide-beige">
        {orders.map((order) => {
          const meta = ORDER_STATUS_META[order.status];
          return (
            <li key={order.id}>
              <Link
                to={`/admin/orders/${order.id}`}
                className="flex items-center justify-between gap-4 py-3.5 transition-colors first:pt-0 last:pb-0 hover:bg-cream/50 -mx-2 px-2 rounded-lg"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">{order.customerName}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    #{order.id} · {order.time}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm text-ink-soft">{order.amount}</span>
                  <StatusBadge variant={meta.variant}>{meta.label}</StatusBadge>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

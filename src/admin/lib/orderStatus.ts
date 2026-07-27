import type { OrderStatus } from "../types/order";
import type { StatusBadgeVariant } from "../components/StatusBadge";

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; variant: StatusBadgeVariant }> = {
  paid: { label: "مدفوع", variant: "success" },
  pending: { label: "قيد الانتظار", variant: "warning" },
  refunded: { label: "مسترجع", variant: "neutral" },
  cancelled: { label: "ملغي", variant: "danger" },
};

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = (
  Object.entries(ORDER_STATUS_META) as [OrderStatus, { label: string; variant: StatusBadgeVariant }][]
).map(([value, meta]) => ({ value, label: meta.label }));

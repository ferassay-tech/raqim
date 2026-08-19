import type { AdminOrder, OrderStatus, PaymentStatus } from "../types/order";
import type { StatusBadgeVariant } from "../components/ui/StatusBadge";

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; variant: StatusBadgeVariant }> = {
  paid: { label: "مدفوع", variant: "success" },
  pending: { label: "قيد الانتظار", variant: "warning" },
  refunded: { label: "مسترجع", variant: "neutral" },
  cancelled: { label: "ملغي", variant: "danger" },
};

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = (
  Object.entries(ORDER_STATUS_META) as [OrderStatus, { label: string; variant: StatusBadgeVariant }][]
).map(([value, meta]) => ({ value, label: meta.label }));

export const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; variant: StatusBadgeVariant }> = {
  pending_review: { label: "بانتظار المراجعة", variant: "warning" },
  confirmed: { label: "مؤكد", variant: "success" },
  rejected: { label: "مرفوض", variant: "danger" },
};

/**
 * Legacy orders (paymentStatus === null, created before this field
 * existed) never had this concept — this derives a display-only label from
 * the order's existing, unrelated `status` instead of writing/backfilling
 * anything. Never persisted, purely for rendering.
 */
export function resolvePaymentStatusMeta(
  order: Pick<AdminOrder, "paymentStatus" | "status">
): { label: string; variant: StatusBadgeVariant } {
  if (order.paymentStatus) return PAYMENT_STATUS_META[order.paymentStatus];
  if (order.status === "paid") return { label: "مؤكد (طلب سابق)", variant: "success" };
  if (order.status === "cancelled" || order.status === "refunded") return { label: "غير منطبق", variant: "neutral" };
  return { label: "بانتظار المراجعة", variant: "warning" };
}

import type { PaymentMethodId } from "@/config/paymentMethods";

export type OrderStatus = "paid" | "pending" | "refunded" | "cancelled";

/**
 * Payment-review state — deliberately distinct from OrderStatus (order
 * fulfillment: paid/pending/refunded/cancelled). "rejected" is
 * representable here but no admin action sets it yet; only Confirm
 * Payment (→ "confirmed") was requested/built so far.
 */
export type PaymentStatus = "pending_review" | "confirmed" | "rejected";

export interface OrderItem {
  bookId: string;
  title: string;
  cover: string | null;
  quantity: number;
  unitPrice: number;
}

export type TimelineTone = "default" | "success" | "warning" | "danger";

export interface OrderTimelineEvent {
  id: string;
  label: string;
  time: string;
  tone: TimelineTone;
}

export interface AdminOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  paymentMethod: string;
  /** Stable, machine-readable payment method key (src/config/paymentMethods.ts),
   * persisted alongside `paymentMethod`'s human-readable snapshot. `null`
   * for every order created before this field existed — no retroactive
   * mapping is attempted, since a title string alone isn't a safe,
   * deterministic source to derive it from. */
  paymentMethodId: PaymentMethodId | null;
  /** `null` for every order created before this field existed — no
   * retroactive inference of historical payment state is attempted; the
   * UI derives a display-only fallback from `status` instead (see
   * resolvePaymentStatusMeta in admin/lib/orderStatus.ts). */
  paymentStatus: PaymentStatus | null;
  /** The payment reference the customer typed in at checkout (e.g. a bank/
   * wallet transaction number) — the one piece of independent evidence an
   * admin has to verify a manual payment. `null` when not provided. */
  transactionId: string | null;
  /** Free-text notes the customer submitted at checkout — distinct from
   * `timeline`, which is the admin's own after-the-fact notes/history.
   * `null` when not provided. */
  customerNotes: string | null;
  items: OrderItem[];
  discount: number;
  createdAt: string;
  timeline: OrderTimelineEvent[];
}

export const ORDER_TOTAL = (order: Pick<AdminOrder, "items" | "discount">) =>
  order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) - order.discount;

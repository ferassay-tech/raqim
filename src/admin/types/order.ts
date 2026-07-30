export type OrderStatus = "paid" | "pending" | "refunded" | "cancelled";

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

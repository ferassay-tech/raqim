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
  items: OrderItem[];
  discount: number;
  createdAt: string;
  timeline: OrderTimelineEvent[];
}

export const ORDER_TOTAL = (order: Pick<AdminOrder, "items" | "discount">) =>
  order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) - order.discount;

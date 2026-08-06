import type { AdminOrder, OrderItem, OrderStatus, OrderTimelineEvent } from "../types/order";
import { createCollectionAdapter } from "../services/data/index.ts";
import type { CollectionAdapter } from "../services/data/index.ts";

/**
 * CMS Phase 6C — repository for orders. Not wired into OrdersContext yet.
 *
 * created_at/updated_at are optional here, unlike every other repository
 * in this codebase (Books/Media/Library all let the client set these
 * because their INSERTs are authenticated-only, so a client-supplied
 * timestamp is trusted). Orders can't make that assumption: checkout is
 * anonymous, so both columns are database-assigned only (default now() /
 * the set_updated_at() trigger) — orderToSupabaseRow() omits both keys
 * when building a row for create(), and update() calls never include
 * updated_at either.
 */

export interface OrderRow {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  status: OrderStatus;
  payment_method: string;
  transaction_id: string | null;
  customer_notes: string | null;
  items: OrderItem[];
  discount: number;
  timeline: OrderTimelineEvent[];
  created_at?: string;
  updated_at?: string;
}

export function orderToSupabaseRow(order: AdminOrder): OrderRow {
  return {
    id: order.id,
    customer_id: order.customerId,
    customer_name: order.customerName,
    customer_email: order.customerEmail,
    status: order.status,
    payment_method: order.paymentMethod,
    transaction_id: order.transactionId,
    customer_notes: order.customerNotes,
    items: order.items,
    discount: order.discount,
    timeline: order.timeline,
  };
}

export function orderFromSupabaseRow(row: OrderRow): AdminOrder {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    status: row.status,
    paymentMethod: row.payment_method,
    transactionId: row.transaction_id,
    customerNotes: row.customer_notes,
    items: row.items,
    discount: row.discount,
    createdAt: (row.created_at ?? "").slice(0, 10),
    timeline: row.timeline,
  };
}

export const ordersRepository: CollectionAdapter<OrderRow> = createCollectionAdapter<OrderRow>(
  "supabase",
  "orders",
  []
);

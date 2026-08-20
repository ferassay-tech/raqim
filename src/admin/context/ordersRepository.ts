import type { AdminOrder, OrderItem, OrderStatus, PaymentStatus, OrderTimelineEvent } from "../types/order";
import type { PaymentMethodId } from "@/config/paymentMethods";
import { createCollectionAdapter } from "../services/data/index.ts";
import type { CollectionAdapter } from "../services/data/index.ts";
import { getSupabaseClient } from "../../lib/supabaseClient.ts";

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
  payment_method_id: PaymentMethodId | null;
  payment_status: PaymentStatus | null;
  transaction_id: string | null;
  customer_notes: string | null;
  items: OrderItem[];
  discount: number;
  timeline: OrderTimelineEvent[];
  deleted_at: string | null;
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
    payment_method_id: order.paymentMethodId,
    payment_status: order.paymentStatus,
    transaction_id: order.transactionId,
    customer_notes: order.customerNotes,
    items: order.items,
    discount: order.discount,
    timeline: order.timeline,
    deleted_at: order.deletedAt,
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
    paymentMethodId: row.payment_method_id,
    paymentStatus: row.payment_status,
    transactionId: row.transaction_id,
    customerNotes: row.customer_notes,
    items: row.items,
    discount: row.discount,
    createdAt: (row.created_at ?? "").slice(0, 10),
    createdAtISO: row.created_at ?? "",
    timeline: row.timeline,
    deletedAt: row.deleted_at,
  };
}

export const ordersRepository: CollectionAdapter<OrderRow> = createCollectionAdapter<OrderRow>(
  "supabase",
  "orders",
  []
);

/**
 * The checkout path's insert can't go through ordersRepository.create():
 * that generic method always does `.insert(row).select().single()`, and
 * Postgres requires INSERT ... RETURNING to also satisfy the table's
 * SELECT policy, not just INSERT's WITH CHECK. orders_select_authenticated
 * deliberately excludes anon (customer PII must not be publicly
 * readable — see the migration), so an anonymous checkout would pass the
 * insert's own check and then fail purely because it can't read the row
 * back. This does a plain insert with no read-back; the caller already
 * knows every field it sent (id is client-generated, createdAt is a
 * display-only date the caller derives locally, exactly as it did before
 * this migration) — the database's own authoritative created_at is still
 * what's actually stored, the anon inserter just never sees it reflected
 * back immediately.
 */
export async function insertOrder(row: OrderRow): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("orders").insert(row);
  if (error) throw error;
}

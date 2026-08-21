import type { PaymentMethodId } from "@/config/paymentMethods";
import type { BookCurrency } from "./book";

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
  /** Full-precision ISO timestamp, kept alongside `createdAt` (which stays
   * date-only for existing display call sites — Orders List, Order Detail,
   * Customer Order History all keep showing just a date, unchanged).
   * Exists solely so dashboard sorting (deriveLatestOrders) can correctly
   * rank multiple orders created on the same calendar day — `createdAt`
   * alone can't distinguish them. Never sent back to Supabase (created_at
   * is a database-assigned column, see orderToSupabaseRow). */
  createdAtISO: string;
  timeline: OrderTimelineEvent[];
  /** Soft-delete marker — mirrors AdminBook.deletedAt exactly. `null` =
   * active (the default for every order); a timestamp = moved to Trash.
   * The original record, id, and every other field stay completely
   * unchanged either way — this is the only field trash/restore ever
   * write. */
  deletedAt: string | null;
  /** The currency this order was actually transacted in — determined
   * solely by the selected payment method at checkout (see A1 remediation:
   * PaymentMethodPage resolves this from config.currency, never from the
   * storefront's indicative USD headline price). `null` only for orders
   * created before this column existed — deliberately never backfilled,
   * since the true historical currency/amount can't be reliably recovered
   * (see groupOrderTotalsByCurrency's doc comment). Every order created
   * through the real checkout flow after this field's introduction always
   * has a concrete value. */
  currency: BookCurrency | null;
}

export const ORDER_TOTAL = (order: Pick<AdminOrder, "items" | "discount">) =>
  order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) - order.discount;

export interface CurrencyGroupedAmount {
  /** `null` = the "legacy/uncurrencied" bucket — orders created before the
   * currency column existed. Never merged into a real currency's total:
   * their stored amount may not even be truly USD-denominated (see A1
   * remediation plan), so folding them into any currency's figure would
   * silently overstate or mislabel it. */
  currency: BookCurrency | null;
  amount: number;
  count: number;
}

/**
 * Groups orders by their transaction currency before summing — the one
 * safe way to aggregate money across more than one order in a system with
 * no FX conversion (RAQIM's USD/EGP/ILS prices are independent, not
 * convertible). Never reduce ORDER_TOTAL across orders without grouping by
 * currency first; doing so silently adds incompatible units together.
 */
export function groupOrderTotalsByCurrency<T extends Pick<AdminOrder, "items" | "discount" | "currency">>(
  orders: T[]
): CurrencyGroupedAmount[] {
  const groups = new Map<BookCurrency | null, { amount: number; count: number }>();
  for (const order of orders) {
    const g = groups.get(order.currency) ?? { amount: 0, count: 0 };
    g.amount += ORDER_TOTAL(order);
    g.count += 1;
    groups.set(order.currency, g);
  }
  return Array.from(groups.entries()).map(([currency, g]) => ({ currency, amount: g.amount, count: g.count }));
}

/** The one shared predicate every active/trash filter site imports —
 * Orders List, Dashboard, Customers List, Customer Profile, and the
 * Messages sidebar's customer panel all use this instead of each
 * re-typing `order.deletedAt === null`. */
export function isActiveOrder(order: Pick<AdminOrder, "deletedAt">): boolean {
  return order.deletedAt === null;
}

export function isTrashedOrder(order: Pick<AdminOrder, "deletedAt">): boolean {
  return order.deletedAt !== null;
}

import type { AdminOrder } from "../types/order";
import { groupOrderTotalsByCurrency } from "../types/order";
import type { AdminCustomer } from "../types/customer";
import type { AdminBook } from "../types/book";

const categoryOf = (books: AdminBook[], bookId: string) => books.find((b) => b.id === bookId)?.category ?? null;

/**
 * Customers are not an independent dataset — they're derived from Orders,
 * the same way Shopify/Stripe treat "customer" as an aggregate view over
 * transactions rather than a separate record that can drift out of sync.
 * A customerId only ever exists here because it exists on at least one
 * order. `books` is passed in (the live BooksContext state) rather than
 * imported from a static seed file, so "favorite category" always reflects
 * the catalog as it actually is right now, not a frozen snapshot.
 */
export function deriveCustomers(orders: AdminOrder[], books: AdminBook[]): AdminCustomer[] {
  const byCustomer = new Map<string, AdminOrder[]>();
  for (const order of orders) {
    const list = byCustomer.get(order.customerId) ?? [];
    list.push(order);
    byCustomer.set(order.customerId, list);
  }

  return Array.from(byCustomer.entries()).map(([id, customerOrders]) => {
    const chronological = [...customerOrders].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const newestFirst = [...customerOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const first = chronological[0];
    const last = chronological[chronological.length - 1];

    const paidOrders = customerOrders.filter((o) => o.status === "paid");
    // Grouped by currency, never blended (see A1 remediation plan) — a
    // customer who paid once in USD and once in EGP gets two separate
    // entries, never one combined number.
    const totalSpent = groupOrderTotalsByCurrency(paidOrders);
    const averageOrderValue = totalSpent.map((group) => ({
      currency: group.currency,
      amount: group.count ? group.amount / group.count : 0,
      count: group.count,
    }));

    const categoryCounts = new Map<string, number>();
    for (const order of customerOrders) {
      for (const orderItem of order.items) {
        const category = categoryOf(books, orderItem.bookId);
        if (!category) continue;
        categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + orderItem.quantity);
      }
    }
    let favoriteCategory: string | null = null;
    let max = 0;
    for (const [category, count] of categoryCounts) {
      if (count > max) {
        max = count;
        favoriteCategory = category;
      }
    }

    const customer: AdminCustomer = {
      id,
      name: first.customerName,
      email: first.customerEmail,
      orders: newestFirst,
      orderCount: customerOrders.length,
      totalSpent,
      averageOrderValue,
      firstOrderDate: first.createdAt,
      lastOrderDate: last.createdAt,
      favoriteCategory,
      segment: customerOrders.length > 1 ? "returning" : "new",
    };
    return customer;
  });
}

export function deriveCustomer(orders: AdminOrder[], books: AdminBook[], customerId: string): AdminCustomer | undefined {
  return deriveCustomers(orders, books).find((c) => c.id === customerId);
}

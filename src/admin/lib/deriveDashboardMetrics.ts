import type { AdminBook, BookCurrency } from "../types/book";
import type { AdminOrder, CurrencyGroupedAmount } from "../types/order";
import { ORDER_TOTAL, groupOrderTotalsByCurrency } from "../types/order";
import type { AdminConversation } from "../types/message";
import type {
  BestSellingBook,
  DashboardMetric,
  LatestMessage,
  LatestOrder,
  NeedsAttentionSummary,
  PublishingPipelineSummary,
} from "../types/dashboard";
import { deriveCustomers } from "./deriveCustomers";
import { formatCurrencyAmount, formatCurrencyGroups } from "./formatCurrencyGroups";

/**
 * Every dashboard number is computed from the real, currently-empty admin
 * stores (Books/Orders/Messages contexts) rather than a separate static
 * mock file — so the dashboard already behaves correctly with zero data,
 * and needs zero changes the day a real backend starts feeding these same
 * contexts real records.
 */
export function deriveHeroMetrics(orders: AdminOrder[], books: AdminBook[]): DashboardMetric[] {
  const paidOrders = orders.filter((o) => o.status === "paid");
  // Grouped by currency, never blended — RAQIM's USD/EGP/ILS prices are
  // independent with no FX conversion, so a single summed "$X" figure would
  // silently add incompatible units together (see A1 remediation plan).
  const revenueByCurrency = groupOrderTotalsByCurrency(paidOrders);
  const customerCount = deriveCustomers(orders, books).length;

  return [
    {
      id: "revenue",
      label: "الإيرادات",
      value: formatCurrencyGroups(revenueByCurrency),
      caption: "إجمالي الإيرادات (الطلبات المدفوعة)",
    },
    {
      id: "orders",
      label: "الطلبات",
      value: orders.length.toLocaleString("en-US"),
      caption: "إجمالي الطلبات",
    },
    {
      id: "customers",
      label: "العملاء",
      value: customerCount.toLocaleString("en-US"),
      caption: "إجمالي العملاء",
    },
  ];
}

/**
 * Visitors/Downloads placeholders were removed from here — they never had
 * real data behind them and don't belong on the Dashboard until a real
 * analytics integration exists (see Future Improvements in the handoff).
 */
export function deriveSecondaryMetrics(books: AdminBook[]): DashboardMetric[] {
  return [
    {
      id: "books",
      label: "إجمالي الكتب",
      value: books.length.toLocaleString("en-US"),
      caption: "في الكتالوج",
    },
  ];
}

export function deriveBestSellingBook(books: AdminBook[], orders: AdminOrder[]): BestSellingBook | null {
  const paidOrders = orders.filter((o) => o.status === "paid");
  if (books.length === 0 || paidOrders.length === 0) return null;

  const unitsByBook = new Map<string, number>();
  for (const order of paidOrders) {
    for (const item of order.items) {
      unitsByBook.set(item.bookId, (unitsByBook.get(item.bookId) ?? 0) + item.quantity);
    }
  }
  if (unitsByBook.size === 0) return null;

  let topBookId = "";
  let topUnits = 0;
  for (const [bookId, units] of unitsByBook) {
    if (units > topUnits) {
      topUnits = units;
      topBookId = bookId;
    }
  }

  const book = books.find((b) => b.id === topBookId);
  if (!book) return null;

  // Grouped by currency — a book sold through more than one payment method
  // can earn revenue in more than one currency, and these must never be
  // summed together (see A1 remediation plan).
  const bookRevenueByCurrency = new Map<BookCurrency | null, number>();
  for (const order of paidOrders) {
    const items = order.items.filter((i) => i.bookId === topBookId);
    if (items.length === 0) continue;
    const amount = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    bookRevenueByCurrency.set(order.currency, (bookRevenueByCurrency.get(order.currency) ?? 0) + amount);
  }
  const bookRevenueGroups: CurrencyGroupedAmount[] = Array.from(bookRevenueByCurrency.entries()).map(
    ([currency, amount]) => ({ currency, amount, count: 0 })
  );

  // "Share of sales" is only meaningful within one currency — computed
  // against whichever currency earned this book the most, compared only to
  // that same currency's total revenue across every book (never a
  // cross-currency blended percentage).
  const dominant = bookRevenueGroups.reduce<CurrencyGroupedAmount | null>(
    (best, g) => (g.amount > (best?.amount ?? -1) ? g : best),
    null
  );
  const totalRevenueByCurrency = groupOrderTotalsByCurrency(paidOrders);
  const totalForDominantCurrency =
    totalRevenueByCurrency.find((g) => g.currency === dominant?.currency)?.amount ?? 0;

  return {
    title: book.title,
    cover: book.cover,
    unitsSold: topUnits,
    revenue: formatCurrencyGroups(bookRevenueGroups),
    shareOfSales: dominant && totalForDominantCurrency > 0 ? dominant.amount / totalForDominantCurrency : 0,
  };
}

export function deriveLatestOrders(orders: AdminOrder[], limit = 5): LatestOrder[] {
  return [...orders]
    // Sorted by the full-precision timestamp, not the date-only `createdAt`
    // — multiple orders created on the same calendar day would otherwise
    // tie and fall back to whatever order the fetch happened to return
    // them in, not true chronological order. `time` below still surfaces
    // `createdAt` (date-only) — this only changes ranking, not display.
    .sort((a, b) => b.createdAtISO.localeCompare(a.createdAtISO))
    .slice(0, limit)
    .map((order) => ({
      id: order.id,
      customerName: order.customerName,
      amount: formatCurrencyAmount(order.currency, ORDER_TOTAL(order)),
      status: order.status,
      time: order.createdAt,
    }));
}

export function deriveLatestMessages(conversations: AdminConversation[], limit = 4): LatestMessage[] {
  return [...conversations]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, limit)
    .map((conversation) => {
      const last = conversation.messages[conversation.messages.length - 1];
      return {
        id: conversation.id,
        sender: conversation.customerName,
        snippet: last?.body ?? "",
        time: conversation.updatedAt,
        unread: conversation.unread,
      };
    });
}

/**
 * What genuinely needs the admin's action today — orders awaiting
 * confirmation and unread conversations, merged into a single list led by
 * the most recent activity. Orders sort by `createdAtISO` (full-precision
 * timestamp, not the date-only `createdAt` — same reasoning as
 * deriveLatestOrders: same-day orders would otherwise tie and fall back to
 * arbitrary fetch order). Messages keep using their own existing
 * `updatedAt` field unchanged — only the shared list's overall direction
 * flipped (newest-first, was oldest-first) so the two kinds can still
 * merge into one coherent feed. How many of these actually get displayed
 * is NeedsAttentionPanel's own concern (a local, user-selectable count) —
 * this function always returns the full, unbounded set.
 */
export function deriveNeedsAttention(orders: AdminOrder[], conversations: AdminConversation[]): NeedsAttentionSummary {
  const pendingItems = orders
    .filter((o) => o.status === "pending")
    .map((order) => ({
      id: order.id,
      kind: "order" as const,
      title: order.customerName,
      detail: formatCurrencyAmount(order.currency, ORDER_TOTAL(order)),
      time: order.createdAtISO,
      href: `/admin/orders/${order.id}`,
    }));

  const unreadItems = conversations
    .filter((c) => c.unread)
    .map((conversation) => ({
      id: conversation.id,
      kind: "message" as const,
      title: conversation.customerName,
      detail: conversation.messages[conversation.messages.length - 1]?.body ?? "",
      time: conversation.updatedAt,
      href: `/admin/messages/${conversation.id}`,
    }));

  const [lead, ...rest] = [...pendingItems, ...unreadItems].sort((a, b) => b.time.localeCompare(a.time));

  return { lead: lead ?? null, rest };
}

/**
 * Whether anything in the catalog is waiting to be finished. The oldest
 * draft by last edit leads — the same transparent "longest waiting first"
 * rule used for Work Start, applied here instead to drafts. It's identified
 * honestly as the oldest draft currently being edited, not as a judgment
 * about which book has been neglected.
 */
export function derivePublishingPipeline(books: AdminBook[]): PublishingPipelineSummary {
  const drafts = books
    .filter((b) => b.status === "draft")
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));

  const [lead, ...rest] = drafts;

  return {
    lead: lead
      ? { id: lead.id, title: lead.title, updatedAt: lead.updatedAt, href: `/admin/books/edit/${lead.id}` }
      : null,
    remainingCount: rest.length,
  };
}

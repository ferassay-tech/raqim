import type { AdminBook } from "../types/book";
import type { AdminOrder } from "../types/order";
import { ORDER_TOTAL } from "../types/order";
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

/**
 * Every dashboard number is computed from the real, currently-empty admin
 * stores (Books/Orders/Messages contexts) rather than a separate static
 * mock file — so the dashboard already behaves correctly with zero data,
 * and needs zero changes the day a real backend starts feeding these same
 * contexts real records.
 */
export function deriveHeroMetrics(orders: AdminOrder[], books: AdminBook[]): DashboardMetric[] {
  const paidOrders = orders.filter((o) => o.status === "paid");
  const revenue = paidOrders.reduce((sum, o) => sum + ORDER_TOTAL(o), 0);
  const customerCount = deriveCustomers(orders, books).length;

  return [
    {
      id: "revenue",
      label: "الإيرادات",
      value: `$${revenue.toFixed(2)}`,
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

  const bookRevenue = paidOrders.reduce((sum, order) => {
    const items = order.items.filter((i) => i.bookId === topBookId);
    return sum + items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  }, 0);
  const totalRevenue = paidOrders.reduce((sum, o) => sum + ORDER_TOTAL(o), 0);

  return {
    title: book.title,
    cover: book.cover,
    unitsSold: topUnits,
    revenue: `$${bookRevenue.toFixed(2)}`,
    shareOfSales: totalRevenue > 0 ? bookRevenue / totalRevenue : 0,
  };
}

export function deriveLatestOrders(orders: AdminOrder[], limit = 5): LatestOrder[] {
  return [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((order) => ({
      id: order.id,
      customerName: order.customerName,
      amount: `$${ORDER_TOTAL(order).toFixed(2)}`,
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
 * confirmation and unread conversations, merged into a single list and
 * led by whichever has been waiting longest. One transparent rule (oldest
 * first) rather than a hidden priority score, so the lead item only ever
 * changes when it's actually resolved — never reshuffles on its own.
 */
export function deriveNeedsAttention(orders: AdminOrder[], conversations: AdminConversation[]): NeedsAttentionSummary {
  const pendingItems = orders
    .filter((o) => o.status === "pending")
    .map((order) => ({
      id: order.id,
      kind: "order" as const,
      title: order.customerName,
      detail: `$${ORDER_TOTAL(order).toFixed(2)}`,
      time: order.createdAt,
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

  const [lead, ...rest] = [...pendingItems, ...unreadItems].sort((a, b) => a.time.localeCompare(b.time));

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

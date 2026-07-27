import type { AdminBook } from "../types/book";
import type { AdminOrder } from "../types/order";
import { ORDER_TOTAL } from "../types/order";
import type { AdminConversation } from "../types/message";
import type { BestSellingBook, DashboardMetric, LatestMessage, LatestOrder } from "../types/dashboard";
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

export function deriveSecondaryMetrics(books: AdminBook[]): DashboardMetric[] {
  return [
    {
      id: "books",
      label: "إجمالي الكتب",
      value: books.length.toLocaleString("en-US"),
      caption: "في الكتالوج",
    },
    {
      id: "visitors",
      label: "الزوار",
      value: "—",
      caption: "بانتظار ربط أداة تحليلات",
    },
    {
      id: "downloads",
      label: "التحميلات",
      value: "—",
      caption: "بانتظار ربط أداة تحليلات",
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

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AdminOrder, OrderItem, OrderStatus, OrderTimelineEvent, TimelineTone } from "../types/order";
import { ORDER_STATUS_META } from "../lib/orderStatus";
import { INITIAL_ORDERS } from "../data/ordersData";
import { insertOrder, orderFromSupabaseRow, orderToSupabaseRow, ordersRepository } from "./ordersRepository.ts";
import { useAuth } from "./AuthContext";

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  transactionId?: string | null;
  customerNotes?: string | null;
  items: OrderItem[];
  discount?: number;
}

interface OrdersContextValue {
  orders: AdminOrder[];
  getOrder: (id: string) => AdminOrder | undefined;
  createOrder: (input: CreateOrderInput) => Promise<AdminOrder>;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  setOrdersStatus: (ids: string[], status: OrderStatus) => void;
  addNote: (id: string, text: string) => void;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

const now = () =>
  new Intl.DateTimeFormat("ar", { hour: "numeric", minute: "numeric" }).format(new Date());

/** Same email → same customer, always — deriveCustomers.ts aggregates
 * orders by customerId, so a repeat purchase must land on the same id or
 * every order looks like a brand-new customer. Deterministic derivation
 * from the customer's own submitted email, not a lookup against existing
 * rows — safe to keep client-side. */
function customerIdFromEmail(email: string): string {
  const slug = email.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `customer-${slug || "guest"}`;
}

/**
 * Orders, backed by the Supabase `orders` table since Phase 6C.
 * Deliberately the one context in this codebase that gates its mount-fetch
 * on auth state: AdminProviders mounts globally (public site + Admin share
 * one instance), and orders_select_authenticated denies anon reads — an
 * ungated fetch would fail RLS and log a console error on every single
 * public pageview. Orders only ever gets fetched once a real admin session
 * exists; no public page reads the `orders` list itself (checkout only
 * ever calls createOrder, never reads back through this context).
 */
export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    ordersRepository
      .list()
      .then((rows) => {
        if (cancelled) return;
        setOrders(rows.map(orderFromSupabaseRow));
      })
      .catch((error) => {
        console.error("Failed to load orders from Supabase:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const getOrder = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);

  const createOrder = useCallback(async (input: CreateOrderInput) => {
    const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const order: AdminOrder = {
      id,
      customerId: customerIdFromEmail(input.customerEmail),
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      status: "pending",
      paymentMethod: input.paymentMethod,
      transactionId: input.transactionId ?? null,
      customerNotes: input.customerNotes ?? null,
      items: input.items,
      discount: input.discount ?? 0,
      createdAt: new Date().toISOString().slice(0, 10),
      timeline: [
        { id: `${id}-t0`, label: "تم إنشاء الطلب من المتجر — بانتظار مراجعة الدفع", time: `اليوم، ${now()}`, tone: "default" },
      ],
    };
    await insertOrder(orderToSupabaseRow(order));
    setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  const setOrderStatus = useCallback(
    (id: string, status: OrderStatus) => {
      const current = orders.find((o) => o.id === id);
      if (!current) return;
      const tone: TimelineTone = ORDER_STATUS_META[status].variant === "danger" ? "danger" : "success";
      const timeline: OrderTimelineEvent[] = [
        ...current.timeline,
        {
          id: `${id}-t${current.timeline.length}`,
          label: `تم تغيير حالة الطلب إلى «${ORDER_STATUS_META[status].label}»`,
          time: `اليوم، ${now()}`,
          tone,
        },
      ];
      void ordersRepository
        .update(id, { status, timeline })
        .then(() => {
          setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status, timeline } : o)));
        })
        .catch((error) => {
          console.error("Failed to update order status:", error);
        });
    },
    [orders]
  );

  const setOrdersStatus = useCallback(
    (ids: string[], status: OrderStatus) => {
      for (const id of ids) setOrderStatus(id, status);
    },
    [setOrderStatus]
  );

  const addNote = useCallback(
    (id: string, text: string) => {
      const current = orders.find((o) => o.id === id);
      if (!current) return;
      const timeline: OrderTimelineEvent[] = [
        ...current.timeline,
        { id: `${id}-t${current.timeline.length}`, label: `ملاحظة: ${text}`, time: `اليوم، ${now()}`, tone: "default" },
      ];
      void ordersRepository
        .update(id, { timeline })
        .then(() => {
          setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, timeline } : o)));
        })
        .catch((error) => {
          console.error("Failed to add order note:", error);
        });
    },
    [orders]
  );

  const value = useMemo(
    () => ({ orders, getOrder, createOrder, setOrderStatus, setOrdersStatus, addNote }),
    [orders, getOrder, createOrder, setOrderStatus, setOrdersStatus, addNote]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}

import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { AdminOrder, OrderItem, OrderStatus } from "../types/order";
import { ORDER_STATUS_META } from "../lib/orderStatus";
import { INITIAL_ORDERS } from "../data/ordersData";
import { usePersistedState } from "../lib/usePersistedState";

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  items: OrderItem[];
  discount?: number;
}

interface OrdersContextValue {
  orders: AdminOrder[];
  getOrder: (id: string) => AdminOrder | undefined;
  createOrder: (input: CreateOrderInput) => AdminOrder;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  setOrdersStatus: (ids: string[], status: OrderStatus) => void;
  addNote: (id: string, text: string) => void;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

const now = () =>
  new Intl.DateTimeFormat("ar", { hour: "numeric", minute: "numeric" }).format(new Date());

/** Same email → same customer, always — deriveCustomers.ts aggregates
 * orders by customerId, so a repeat purchase must land on the same id or
 * every order looks like a brand-new customer. */
function customerIdFromEmail(email: string): string {
  const slug = email.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `customer-${slug || "guest"}`;
}

/** In-memory operations store for orders — Milestone 2D is frontend-only.
 * Status changes and notes append real timeline entries so the Order Detail
 * page's history stays truthful to what the admin actually did this session. */
export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = usePersistedState<AdminOrder[]>("orders", INITIAL_ORDERS);

  const getOrder = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);

  const createOrder = useCallback(
    (input: CreateOrderInput) => {
      const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
      const order: AdminOrder = {
        id,
        customerId: customerIdFromEmail(input.customerEmail),
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        status: "pending",
        paymentMethod: input.paymentMethod,
        items: input.items,
        discount: input.discount ?? 0,
        createdAt: new Date().toISOString().slice(0, 10),
        timeline: [
          { id: `${id}-t0`, label: "تم إنشاء الطلب من المتجر — بانتظار مراجعة الدفع", time: `اليوم، ${now()}`, tone: "default" },
        ],
      };
      setOrders((prev) => [order, ...prev]);
      return order;
    },
    [setOrders]
  );

  const setOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status,
              timeline: [
                ...o.timeline,
                {
                  id: `${id}-t${o.timeline.length}`,
                  label: `تم تغيير حالة الطلب إلى «${ORDER_STATUS_META[status].label}»`,
                  time: `اليوم، ${now()}`,
                  tone: ORDER_STATUS_META[status].variant === "danger" ? "danger" : "success",
                },
              ],
            }
          : o
      )
    );
  }, [setOrders]);

  const setOrdersStatus = useCallback((ids: string[], status: OrderStatus) => {
    const idSet = new Set(ids);
    setOrders((prev) =>
      prev.map((o) =>
        idSet.has(o.id)
          ? {
              ...o,
              status,
              timeline: [
                ...o.timeline,
                {
                  id: `${o.id}-t${o.timeline.length}`,
                  label: `تم تغيير حالة الطلب إلى «${ORDER_STATUS_META[status].label}»`,
                  time: `اليوم، ${now()}`,
                  tone: ORDER_STATUS_META[status].variant === "danger" ? "danger" : "success",
                },
              ],
            }
          : o
      )
    );
  }, [setOrders]);

  const addNote = useCallback((id: string, text: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              timeline: [
                ...o.timeline,
                { id: `${id}-t${o.timeline.length}`, label: `ملاحظة: ${text}`, time: `اليوم، ${now()}`, tone: "default" },
              ],
            }
          : o
      )
    );
  }, [setOrders]);

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

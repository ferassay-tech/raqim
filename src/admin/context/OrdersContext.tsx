import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AdminOrder, OrderItem, OrderStatus, OrderTimelineEvent, PaymentStatus, TimelineTone } from "../types/order";
import type { PaymentMethodId } from "@/config/paymentMethods";
import { ORDER_STATUS_META } from "../lib/orderStatus";
import { INITIAL_ORDERS } from "../data/ordersData";
import { insertOrder, orderFromSupabaseRow, orderToSupabaseRow, ordersRepository } from "./ordersRepository.ts";
import { useAuth } from "./AuthContext";

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  paymentMethodId: PaymentMethodId;
  transactionId?: string | null;
  customerNotes?: string | null;
  items: OrderItem[];
  discount?: number;
}

/** Fixed, matched exactly by the idempotency check in OrderDetailPage
 * before ever attempting to auto-send the download email a second time. */
export const EMAIL_SENT_TIMELINE_LABEL = "تم إرسال بريد رابط التحميل للعميلة";

/** Separate from EMAIL_SENT_TIMELINE_LABEL on purpose — a different
 * audience/event (admin notification, not the customer download email).
 * This is a human-readable, client-side fast-path check only; the
 * authoritative duplicate-send guard is the DB-level claim in
 * order_notification_claims (see api/send-admin-payment-notification.ts,
 * migration 20260819130001), which is what actually closes the concurrent
 * race this check alone cannot. */
export const ADMIN_NOTIFICATION_SENT_TIMELINE_LABEL = "تم إرسال إشعار تأكيد الدفع للإدارة";

export interface ConfirmPaymentOutcome {
  ok: boolean;
  /** True when payment_status was already "confirmed" before this call —
   * the update was skipped entirely, nothing was written twice. */
  alreadyConfirmed: boolean;
  error?: string;
}

interface OrdersContextValue {
  orders: AdminOrder[];
  getOrder: (id: string) => AdminOrder | undefined;
  createOrder: (input: CreateOrderInput) => Promise<AdminOrder>;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  setOrdersStatus: (ids: string[], status: OrderStatus) => void;
  addNote: (id: string, text: string) => void;
  /** Sets payment_status="confirmed" and status="paid" as one update, plus
   * one timeline entry — guarded against double-confirmation. Does not
   * touch download tokens or email; that orchestration lives in
   * OrderDetailPage, which has access to the Downloads/Library/
   * CommunicationTemplates contexts this context deliberately does not
   * depend on (OrdersProvider is mounted above them in AdminProviders). */
  confirmPayment: (id: string) => Promise<ConfirmPaymentOutcome>;
  /** Records the one, fixed-label "download email sent" timeline event —
   * called only after a real send succeeds (see OrderDetailPage). */
  recordEmailSent: (id: string) => void;
  /** Records the one, fixed-label "admin notification sent" timeline event
   * — a distinct entry from recordEmailSent, called only after the new
   * admin-notification endpoint confirms a real send (not an
   * already-claimed no-op). Purely the human-readable record; see
   * ADMIN_NOTIFICATION_SENT_TIMELINE_LABEL for why this alone isn't the
   * duplicate-send guard. */
  recordAdminNotificationSent: (id: string) => void;
  loadError: string | null;
  reload: () => void;
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    setLoadError(null);
    ordersRepository
      .list()
      .then((rows) => {
        if (cancelled) return;
        setOrders(rows.map(orderFromSupabaseRow));
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load orders from Supabase:", error);
        setLoadError("تعذر تحميل الطلبات من الخادم.");
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, reloadToken]);

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
      paymentMethodId: input.paymentMethodId,
      paymentStatus: "pending_review",
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

  const confirmPayment = useCallback(
    async (id: string): Promise<ConfirmPaymentOutcome> => {
      const current = orders.find((o) => o.id === id);
      if (!current) return { ok: false, alreadyConfirmed: false, error: "الطلب غير موجود." };
      if (current.paymentStatus === "confirmed") {
        return { ok: true, alreadyConfirmed: true };
      }

      const timeline: OrderTimelineEvent[] = [
        ...current.timeline,
        {
          id: `${id}-t${current.timeline.length}`,
          label: "تم تأكيد الدفع من قِبل الإدارة",
          time: `اليوم، ${now()}`,
          tone: "success",
        },
      ];
      const paymentStatus: PaymentStatus = "confirmed";
      const status: OrderStatus = "paid";

      try {
        // One update call for payment_status + status + timeline — the
        // "one logical confirmation operation" the flow requires.
        await ordersRepository.update(id, { payment_status: paymentStatus, status, timeline });
        setOrders((prev) => (prev.map((o) => (o.id === id ? { ...o, paymentStatus, status, timeline } : o))));
        return { ok: true, alreadyConfirmed: false };
      } catch (error) {
        console.error("Failed to confirm payment:", error);
        return { ok: false, alreadyConfirmed: false, error: "تعذر تأكيد الدفع." };
      }
    },
    [orders]
  );

  const recordEmailSent = useCallback(
    (id: string) => {
      const current = orders.find((o) => o.id === id);
      if (!current) return;
      const timeline: OrderTimelineEvent[] = [
        ...current.timeline,
        { id: `${id}-t${current.timeline.length}`, label: EMAIL_SENT_TIMELINE_LABEL, time: `اليوم، ${now()}`, tone: "success" },
      ];
      void ordersRepository
        .update(id, { timeline })
        .then(() => {
          setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, timeline } : o)));
        })
        .catch((error) => {
          console.error("Failed to record download-email timeline event:", error);
        });
    },
    [orders]
  );

  const recordAdminNotificationSent = useCallback(
    (id: string) => {
      const current = orders.find((o) => o.id === id);
      if (!current) return;
      const timeline: OrderTimelineEvent[] = [
        ...current.timeline,
        {
          id: `${id}-t${current.timeline.length}`,
          label: ADMIN_NOTIFICATION_SENT_TIMELINE_LABEL,
          time: `اليوم، ${now()}`,
          tone: "success",
        },
      ];
      void ordersRepository
        .update(id, { timeline })
        .then(() => {
          setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, timeline } : o)));
        })
        .catch((error) => {
          console.error("Failed to record admin-notification timeline event:", error);
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
    () => ({
      orders,
      getOrder,
      createOrder,
      setOrderStatus,
      setOrdersStatus,
      addNote,
      confirmPayment,
      recordEmailSent,
      recordAdminNotificationSent,
      loadError,
      reload,
    }),
    [
      orders,
      getOrder,
      createOrder,
      setOrderStatus,
      setOrdersStatus,
      addNote,
      confirmPayment,
      recordEmailSent,
      recordAdminNotificationSent,
      loadError,
      reload,
    ]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}

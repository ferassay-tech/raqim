import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AdminOrder, OrderItem, OrderStatus, OrderTimelineEvent, PaymentStatus, TimelineTone } from "../types/order";
import type { BookCurrency } from "../types/book";
import type { PaymentMethodId } from "@/config/paymentMethods";
import { ORDER_STATUS_META } from "../lib/orderStatus";
import { INITIAL_ORDERS } from "../data/ordersData";
import {
  getOrderIdByCheckoutAttempt,
  insertOrder,
  isCheckoutAttemptConflict,
  orderFromSupabaseRow,
  orderToSupabaseRow,
  ordersRepository,
} from "./ordersRepository.ts";
import { useAuth } from "./AuthContext";
import { getSupabaseClient } from "../../lib/supabaseClient.ts";

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  paymentMethodId: PaymentMethodId;
  /** The currency this order is actually transacted in — determined solely
   * by the selected payment method (never a USD fallback). Required: every
   * order created through the real checkout flow always has a payment
   * method selected first, so a currency is always known at this point
   * (mirrors paymentMethodId's own required, non-nullable shape here). */
  currency: BookCurrency;
  transactionId?: string | null;
  customerNotes?: string | null;
  items: OrderItem[];
  discount?: number;
  /** Whether the customer selected a receipt file at checkout — purely
   * informational, passed straight into the admin purchase-notification
   * email (see createOrder below). Reflects intent to attach, not confirmed
   * upload success: the actual upload is a separate async step
   * (PaymentMethodPage.attemptAttachmentUpload) that must never delay or
   * gate this notification. */
  hasReceiptFile?: boolean;
  /** Identifies the checkout attempt this submission belongs to (see
   * CheckoutContext.checkoutAttemptId) — the actual duplicate-order guard.
   * Optional only so existing callers/tests that don't pass one still
   * type-check; a real checkout submission always provides it. */
  checkoutAttemptId?: string | null;
}

/** Fixed, matched exactly by the idempotency check in OrderDetailPage
 * before ever attempting to auto-send the download email a second time. */
export const EMAIL_SENT_TIMELINE_LABEL = "تم إرسال بريد رابط التحميل للعميلة";

/** The admin "purchase notification" timeline event — fired once
 * createOrder()'s fire-and-forget call to /api/send-admin-payment-notification
 * resolves with a genuine send (not an already-claimed/no-recipients
 * no-op). This label previously represented a "payment confirmed"
 * notification; it now represents the corrected event — a customer
 * submitting their payment information — repurposed rather than
 * duplicated per the corrected business requirement. This is a
 * human-readable, client-side record only; the authoritative duplicate-
 * send guard is the DB-level claim in order_notification_claims (see
 * api/send-admin-payment-notification.ts), which is what actually closes
 * the concurrent race this label alone cannot. */
export const ADMIN_NOTIFICATION_SENT_TIMELINE_LABEL = "تم إرسال إشعار عملية الشراء للإدارة";

export interface ConfirmPaymentOutcome {
  ok: boolean;
  /** True when payment_status was already "confirmed" before this call —
   * the update was skipped entirely, nothing was written twice. */
  alreadyConfirmed: boolean;
  error?: string;
}

export interface PermanentDeleteOutcome {
  /** True when the order row itself (and, via ON DELETE CASCADE, its
   * download_tokens/order_attachments/order_notification_claims rows)
   * was successfully deleted but the best-effort Storage file cleanup
   * that follows it did not fully succeed — see permanentlyDeleteOrder's
   * own comment for exactly why this can never leave the database
   * itself in an inconsistent state. */
  storageCleanupFailed: boolean;
}

interface OrdersContextValue {
  orders: AdminOrder[];
  getOrder: (id: string) => AdminOrder | undefined;
  createOrder: (input: CreateOrderInput) => Promise<AdminOrder & { isExistingOrder: boolean }>;
  /** Awaited (not fire-and-forget) so OrderPaymentCard's sensitive
   * status-change confirmation (refund/cancel) can show a real busy state
   * and only close on success. */
  setOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  /** Best-effort per item, matching this context's existing semantics —
   * not a newly-invented all-or-nothing rule. */
  setOrdersStatus: (ids: string[], status: OrderStatus) => Promise<void>;
  addNote: (id: string, text: string) => Promise<void>;
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
  /** Soft delete — sets deletedAt, hides the order from active Orders/
   * Dashboard/Customers views but keeps it fully intact and recoverable
   * from the Trash view. Mirrors BooksContext.deleteBook exactly: a plain
   * UPDATE of one column, plus one timeline entry. Never touches
   * payment_status, status, transaction_id, or any other field, and never
   * calls any email/notification/payment endpoint. */
  moveOrderToTrash: (id: string) => Promise<void>;
  /** Clears deletedAt — the exact same record becomes active again, same
   * id, same every other field. Mirrors BooksContext.restoreBook. */
  restoreOrder: (id: string) => void;
  /** Actually removes the record — only ever called from the Trash view,
   * only ever reachable by the platform owner (orders_delete_owner RLS).
   * See its own implementation comment for the Storage-cleanup ordering
   * and failure behavior. */
  permanentlyDeleteOrder: (id: string) => Promise<PermanentDeleteOutcome>;
  loadError: string | null;
  reload: () => void;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    setLoadError(null);
    setIsLoading(true);
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
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, reloadToken]);

  // Orders is fetched exactly once per session by the effect above — a new
  // order created from a customer's own separate browser session has no
  // way to reach this admin's already-mounted state otherwise, so the
  // Dashboard's "Latest Orders"/"Needs Attention" (and every other orders
  // view) can silently go stale. Re-triggering the existing `reload()` on
  // tab/window return is a lightweight, event-based fix — not polling, not
  // a timer, just re-running the same fetch this context already does
  // whenever the admin actually comes back to look. `visibilitychange`
  // alone (not also `focus`) is deliberate: switching OS-level windows
  // already flips a background tab's visibilityState too in virtually
  // every modern browser, so a separate `focus` listener would mostly just
  // double the fetch on a single tab-return.
  useEffect(() => {
    if (!isAuthenticated) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") reload();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, reload]);

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
      currency: input.currency,
      paymentStatus: "pending_review",
      transactionId: input.transactionId ?? null,
      customerNotes: input.customerNotes ?? null,
      items: input.items,
      discount: input.discount ?? 0,
      createdAt: new Date().toISOString().slice(0, 10),
      createdAtISO: new Date().toISOString(),
      deletedAt: null,
      timeline: [
        { id: `${id}-t0`, label: "تم إنشاء الطلب من المتجر — بانتظار مراجعة الدفع", time: `اليوم، ${now()}`, tone: "default" },
      ],
    };
    try {
      await insertOrder({ ...orderToSupabaseRow(order), checkout_attempt_id: input.checkoutAttemptId ?? null });
    } catch (error) {
      // A 23505 on orders_checkout_attempt_id_unique_idx means this exact
      // checkout attempt already produced an order — rapid re-clicks,
      // a browser retry, or a resubmit after refresh, never a different
      // customer's coincidence (the attempt id is a client-generated
      // UUID). Resolve to that existing order instead of creating a
      // second one or surfacing an error; skip the notification fetch
      // below entirely, since the request that actually created the row
      // already triggered (and order_notification_claims already
      // guarantees exactly one send for) it.
      if (input.checkoutAttemptId && isCheckoutAttemptConflict(error)) {
        const existingId = await getOrderIdByCheckoutAttempt(input.checkoutAttemptId);
        if (existingId) {
          return { ...order, id: existingId, isExistingOrder: true };
        }
      }
      throw error;
    }
    setOrders((prev) => [order, ...prev]);

    // Fire-and-forget admin purchase notification — triggered because the
    // order was just successfully persisted, not because payment was
    // confirmed (that's a separate, later, independent event handled
    // entirely by confirmPayment/OrderDetailPage). Never awaited, never
    // allowed to affect createOrder()'s own resolution: a checkout must
    // succeed for the customer regardless of whether this notification
    // succeeds, fails, or is a legitimate no-op (already claimed/no
    // recipients). Deliberately inlined here rather than reusing a shared
    // "recordX" callback: those close over the live `orders` state via
    // useCallback deps, and createOrder's own `[]` deps would capture a
    // stale (seed-data) version of such a callback — building the
    // timeline update from the `order`/`id` already in this scope avoids
    // that trap entirely.
    void fetch("/api/send-admin-payment-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id, hasReceiptFile: input.hasReceiptFile ?? false }),
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        // Only a genuine send gets the timeline record — an already-
        // claimed or no-recipients response is a legitimate no-op, not an
        // event that happened.
        if (!response.ok || body?.alreadySent || body?.skippedNoRecipients) return;
        const timeline: OrderTimelineEvent[] = [
          ...order.timeline,
          {
            id: `${id}-t${order.timeline.length}`,
            label: ADMIN_NOTIFICATION_SENT_TIMELINE_LABEL,
            time: `اليوم، ${now()}`,
            tone: "success",
          },
        ];
        await ordersRepository.update(id, { timeline });
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, timeline } : o)));
      })
      .catch((error) => {
        console.error("Failed to send admin purchase notification:", error);
      });

    return { ...order, isExistingOrder: false };
  }, []);

  const setOrderStatus = useCallback(
    async (id: string, status: OrderStatus) => {
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
      // Awaited (not fire-and-forget) so OrderPaymentCard's sensitive
      // status-change confirmation (refund/cancel) can show a real busy
      // state and only close on success.
      await ordersRepository.update(id, { status, timeline });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status, timeline } : o)));
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

  const moveOrderToTrash = useCallback(
    async (id: string) => {
      const current = orders.find((o) => o.id === id);
      if (!current) return;
      const deletedAt = new Date().toISOString();
      const timeline: OrderTimelineEvent[] = [
        ...current.timeline,
        { id: `${id}-t${current.timeline.length}`, label: "تم نقل الطلب إلى المحذوفات", time: `اليوم، ${now()}`, tone: "warning" },
      ];
      await ordersRepository.update(id, { deleted_at: deletedAt, timeline });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, deletedAt, timeline } : o)));
    },
    [orders]
  );

  const restoreOrder = useCallback(
    (id: string) => {
      const current = orders.find((o) => o.id === id);
      if (!current) return;
      const timeline: OrderTimelineEvent[] = [
        ...current.timeline,
        { id: `${id}-t${current.timeline.length}`, label: "تمت استعادة الطلب من المحذوفات", time: `اليوم، ${now()}`, tone: "success" },
      ];
      void ordersRepository
        .update(id, { deleted_at: null, timeline })
        .then(() => {
          setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, deletedAt: null, timeline } : o)));
        })
        .catch((error) => {
          console.error("Failed to restore order:", error);
        });
    },
    [orders]
  );

  /**
   * Only ever called from the Trash view, behind an explicit confirm
   * dialog. The entire operation — authentication, owner authorization,
   * attachment-path lookup, the order DELETE itself, and Storage cleanup
   * — happens server-side in /api/order-attachment-storage-cleanup, after
   * a security review found an earlier client-supplied-paths version of
   * that endpoint was an unauthenticated arbitrary-file-delete
   * vulnerability. This function's only job now is sending the caller's
   * own current access token (never a client-asserted user id/role) and
   * the orderId — never any storage path. The server independently
   * re-derives every authorization decision and every path; see that
   * file's own header comment for the full, safety-critical step order.
   */
  const permanentlyDeleteOrder = useCallback(async (id: string): Promise<PermanentDeleteOutcome> => {
    const supabase = getSupabaseClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      throw new Error("لا توجد جلسة نشطة.");
    }

    const response = await fetch("/api/order-attachment-storage-cleanup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId: id }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(body?.error ?? "تعذر حذف الطلب نهائيًا.");
    }

    setOrders((prev) => prev.filter((o) => o.id !== id));
    return { storageCleanupFailed: Boolean(body?.storageCleanupFailed) };
  }, []);

  const setOrdersStatus = useCallback(
    async (ids: string[], status: OrderStatus) => {
      await Promise.all(
        ids.map((id) =>
          setOrderStatus(id, status).catch((error) => {
            console.error("Failed to update order status:", error);
          })
        )
      );
    },
    [setOrderStatus]
  );

  const addNote = useCallback(
    async (id: string, text: string) => {
      const current = orders.find((o) => o.id === id);
      if (!current) return;
      const timeline: OrderTimelineEvent[] = [
        ...current.timeline,
        { id: `${id}-t${current.timeline.length}`, label: `ملاحظة: ${text}`, time: `اليوم، ${now()}`, tone: "default" },
      ];
      await ordersRepository.update(id, { timeline });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, timeline } : o)));
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
      moveOrderToTrash,
      restoreOrder,
      permanentlyDeleteOrder,
      loadError,
      reload,
      isLoading,
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
      moveOrderToTrash,
      restoreOrder,
      permanentlyDeleteOrder,
      loadError,
      reload,
      isLoading,
    ]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}

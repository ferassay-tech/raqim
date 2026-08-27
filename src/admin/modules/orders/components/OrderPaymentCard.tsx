import { useState } from "react";
import type { AdminOrder, OrderStatus } from "@/admin/types/order";
import { ORDER_STATUS_OPTIONS, resolvePaymentStatusMeta } from "@/admin/lib/orderStatus";
import { SegmentedControl } from "@/admin/components/forms/SegmentedControl";
import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { CopyIconButton } from "@/admin/components/ui/CopyIconButton";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { useHasPermission } from "@/admin/lib/useHasPermission";
import { PaymentMethodBadge } from "./PaymentMethodBadge";

/** The full outcome of one Confirm Payment click, including the
 * token/email orchestration OrderDetailPage performs after the payment
 * itself is confirmed — communicated back here purely for feedback
 * display, never re-derived or duplicated. No longer carries any admin-
 * notification outcome: that notification now fires earlier, from
 * OrdersContext.createOrder() when the customer's order is first
 * submitted, entirely independent of this confirm-payment flow. */
export type ConfirmPaymentFlowResult =
  | { status: "already-confirmed" }
  | { status: "confirmed-email-sent" }
  | { status: "confirmed-no-email"; reason: string }
  | { status: "confirmed-email-failed"; reason: string }
  | { status: "error"; message: string };

interface OrderPaymentCardProps {
  order: AdminOrder;
  onStatusChange: (status: OrderStatus) => Promise<void>;
  onConfirmPayment: () => Promise<ConfirmPaymentFlowResult>;
}

const SENSITIVE: OrderStatus[] = ["refunded", "cancelled"];

export function OrderPaymentCard({ order, onStatusChange, onConfirmPayment }: OrderPaymentCardProps) {
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [statusChangeError, setStatusChangeError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmFeedback, setConfirmFeedback] = useState<{ tone: "success" | "warning" | "error"; message: string } | null>(
    null
  );
  const hasPermission = useHasPermission();
  // Same capability that already gates the pending→paid transition in the
  // status control below — Confirm Payment is the same class of action,
  // no new permission concept introduced. Resolved via has_permission()'s
  // effective-permission computation (role default + any per-user
  // override), matching the real orders_update_editor_or_owner RLS gate —
  // the legacy role-only can() check here previously ignored an override,
  // so a UI control could stay enabled after an owner had revoked
  // orders.manage from this specific admin, only to fail silently at RLS.
  const canChangeStatus = hasPermission("orders.manage");
  const paymentStatusMeta = resolvePaymentStatusMeta(order);

  const handleConfirmPayment = async () => {
    if (isConfirming) return;
    setIsConfirming(true);
    setConfirmFeedback(null);
    const result = await onConfirmPayment();
    setIsConfirming(false);
    switch (result.status) {
      case "already-confirmed":
        setConfirmFeedback({ tone: "success", message: "تم تأكيد الدفع مسبقًا لهذا الطلب." });
        break;
      case "confirmed-email-sent":
        setConfirmFeedback({ tone: "success", message: "تم تأكيد الدفع وإرسال بريد التحميل إلى العميلة بنجاح." });
        break;
      case "confirmed-no-email":
        setConfirmFeedback({ tone: "success", message: `تم تأكيد الدفع. ${result.reason}` });
        break;
      case "confirmed-email-failed":
        setConfirmFeedback({ tone: "warning", message: `تم تأكيد الدفع، لكن تعذّر إرسال بريد التحميل. ${result.reason}` });
        break;
      case "error":
        setConfirmFeedback({ tone: "error", message: result.message });
        break;
    }
  };

  const requestChange = (status: string) => {
    const next = status as OrderStatus;
    if (next === order.status) return;
    if (SENSITIVE.includes(next) && !canChangeStatus) return;
    if (SENSITIVE.includes(next)) {
      setStatusChangeError(null);
      setPendingStatus(next);
    } else {
      onStatusChange(next).catch((error) => {
        console.error("Failed to update order status:", error);
      });
    }
  };

  const statusOptions = ORDER_STATUS_OPTIONS.map((opt) => ({
    ...opt,
    disabled: SENSITIVE.includes(opt.value) && !canChangeStatus,
  }));

  return (
    <div className="rounded-md border border-beige bg-white/70 p-6 shadow-(--shadow-soft) backdrop-blur">
      <h2 className="font-display text-h2 text-ink">تفاصيل الطلب</h2>

      <dl className="mt-4 flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-ink-faint">رقم الطلب</dt>
          <dd className="flex items-center gap-1 text-ink" dir="ltr">
            #{order.id}
            <CopyIconButton value={order.id} label="نسخ رقم الطلب" className="h-6 w-6" />
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-faint">تاريخ الطلب</dt>
          <dd className="text-ink">{order.createdAt}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-faint">طريقة الدفع</dt>
          <dd>
            <PaymentMethodBadge order={order} />
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-faint">رقم العملية</dt>
          <dd className="text-ink" dir={order.transactionId ? "ltr" : undefined}>
            {order.transactionId || "غير متوفر"}
          </dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-beige pt-5">
        <p className="text-xs uppercase tracking-[0.15em] text-ink-faint">حالة الدفع</p>
        <div className="mt-2">
          <StatusBadge variant={paymentStatusMeta.variant}>{paymentStatusMeta.label}</StatusBadge>
        </div>

        {order.paymentStatus !== "confirmed" && canChangeStatus && (
          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={isConfirming}
            className="mt-4 w-full rounded-full bg-ink py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep disabled:cursor-wait disabled:opacity-60"
          >
            {isConfirming ? "جارٍ التأكيد..." : "تأكيد الدفع"}
          </button>
        )}

        {confirmFeedback && (
          <p
            className={`mt-3 text-xs leading-relaxed ${
              confirmFeedback.tone === "success"
                ? "text-success"
                : confirmFeedback.tone === "warning"
                  ? "text-warning"
                  : "text-danger"
            }`}
          >
            {confirmFeedback.message}
          </p>
        )}
      </div>

      <div className="mt-5 border-t border-beige pt-5">
        <SegmentedControl
          label="حالة الطلب"
          value={order.status}
          onChange={requestChange}
          options={statusOptions}
        />
        {!canChangeStatus && (
          <p className="mt-2 text-xs text-ink-faint">صلاحيتك الحالية لا تسمح بتحديد الطلب كمسترجع أو ملغي.</p>
        )}
        {statusChangeError && <p className="mt-2 text-xs text-danger">{statusChangeError}</p>}
      </div>

      <ConfirmDialog
        open={pendingStatus !== null}
        title={pendingStatus === "cancelled" ? "إلغاء الطلب" : "استرجاع المبلغ"}
        description={
          pendingStatus === "cancelled"
            ? "هل تريدين إلغاء هذا الطلب؟ سيتم تسجيل ذلك في السجل الزمني للطلب."
            : "هل تريدين تحديد هذا الطلب كمسترجع؟ سيتم تسجيل ذلك في السجل الزمني للطلب."
        }
        confirmLabel="تأكيد"
        busy={isChangingStatus}
        onConfirm={async () => {
          if (!pendingStatus || isChangingStatus) return;
          setIsChangingStatus(true);
          try {
            await onStatusChange(pendingStatus);
            setPendingStatus(null);
          } catch (error) {
            console.error("Failed to update order status:", error);
            setStatusChangeError("تعذر تحديث حالة الطلب. حاولي مرة أخرى.");
          } finally {
            setIsChangingStatus(false);
          }
        }}
        onCancel={() => setPendingStatus(null)}
      />
    </div>
  );
}

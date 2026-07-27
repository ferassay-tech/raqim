import { useState } from "react";
import type { AdminOrder, OrderStatus } from "../../types/order";
import { ORDER_STATUS_OPTIONS } from "../../lib/orderStatus";
import { SegmentedControl } from "../form/SegmentedControl";
import { ConfirmDialog } from "../ConfirmDialog";
import { CopyIconButton } from "../CopyIconButton";

interface OrderPaymentCardProps {
  order: AdminOrder;
  onStatusChange: (status: OrderStatus) => void;
}

const SENSITIVE: OrderStatus[] = ["refunded", "cancelled"];

export function OrderPaymentCard({ order, onStatusChange }: OrderPaymentCardProps) {
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);

  const requestChange = (status: string) => {
    const next = status as OrderStatus;
    if (next === order.status) return;
    if (SENSITIVE.includes(next)) {
      setPendingStatus(next);
    } else {
      onStatusChange(next);
    }
  };

  return (
    <div className="rounded-[10px] border border-beige bg-white/70 p-6 shadow-(--shadow-soft) backdrop-blur">
      <h2 className="font-display text-lg text-ink">تفاصيل الطلب</h2>

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
          <dd className="text-ink">{order.paymentMethod}</dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-beige pt-5">
        <SegmentedControl
          label="حالة الطلب"
          value={order.status}
          onChange={requestChange}
          options={ORDER_STATUS_OPTIONS}
        />
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
        onConfirm={() => {
          if (pendingStatus) onStatusChange(pendingStatus);
          setPendingStatus(null);
        }}
        onCancel={() => setPendingStatus(null)}
      />
    </div>
  );
}

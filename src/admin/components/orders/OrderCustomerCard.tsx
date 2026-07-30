import { Link } from "react-router-dom";
import type { AdminOrder } from "../../types/order";
import { CopyIconButton } from "../CopyIconButton";
import { CustomerAvatar } from "../customers/CustomerAvatar";
import { IconChevronStart } from "../../icons";

interface OrderCustomerCardProps {
  order: AdminOrder;
}

/** Deliberately the first thing rendered in the detail sidebar — every
 * order exists because of a customer, so her identity leads, not the
 * transaction mechanics. */
export function OrderCustomerCard({ order }: OrderCustomerCardProps) {
  return (
    <div className="rounded-[10px] border border-beige bg-white/70 p-6 shadow-(--shadow-soft) backdrop-blur">
      <p className="text-xs uppercase tracking-[0.15em] text-ink-faint">العميلة</p>
      <div className="mt-3 flex items-center gap-3.5">
        <CustomerAvatar name={order.customerName} />
        <div className="min-w-0">
          <p className="truncate font-display text-lg text-ink">{order.customerName}</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <p className="truncate text-xs text-ink-faint" dir="ltr">
              {order.customerEmail}
            </p>
            <CopyIconButton value={order.customerEmail} label="نسخ البريد الإلكتروني" className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-beige pt-5">
        <p className="text-xs uppercase tracking-[0.15em] text-ink-faint">ملاحظات العميلة</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {order.customerNotes || "لا توجد ملاحظات من العميلة."}
        </p>
      </div>

      <Link
        to={`/admin/customers/${order.customerId}`}
        className="group mt-5 inline-flex items-center gap-1 text-xs text-gold-deep transition-colors hover:text-gold"
      >
        عرض ملف العميلة الكامل
        <IconChevronStart className="h-3 w-3 transition-transform duration-200 group-hover:-translate-x-0.5" />
      </Link>
    </div>
  );
}

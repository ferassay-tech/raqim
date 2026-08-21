import { Link } from "react-router-dom";
import type { AdminConversation } from "@/admin/types/message";
import { useOrders } from "@/admin/context/OrdersContext";
import { isActiveOrder } from "@/admin/types/order";
import { useBooks } from "@/admin/context/BooksContext";
import { deriveCustomer } from "@/admin/lib/deriveCustomers";
import { formatCurrencyGroups } from "@/admin/lib/formatCurrencyGroups";
import { CustomerAvatar } from "@/admin/components/ui/CustomerAvatar";
import { CopyIconButton } from "@/admin/components/ui/CopyIconButton";
import { CustomerOrderHistoryCard } from "@/admin/modules/customers/components/CustomerOrderHistoryCard";
import { IconChevronStart } from "@/admin/icons";

interface ConversationCustomerPanelProps {
  conversation: AdminConversation;
}

export function ConversationCustomerPanel({ conversation }: ConversationCustomerPanelProps) {
  const { orders } = useOrders();
  const { books } = useBooks();
  // Trashed orders must not count toward this customer's order count/total
  // spent — otherwise the same customer would show different numbers here
  // than on their Customer Profile page (CustomerProfilePage.tsx), which
  // already excludes them.
  const customer = conversation.customerId
    ? deriveCustomer(orders.filter(isActiveOrder), books, conversation.customerId)
    : undefined;

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <CustomerAvatar name={conversation.customerName} size="lg" />
        <div>
          <p className="font-display text-lg text-ink">{conversation.customerName}</p>
          <div className="mt-1 flex items-center justify-center gap-1">
            <span className="truncate text-xs text-ink-faint" dir="ltr">
              {conversation.customerEmail}
            </span>
            <CopyIconButton value={conversation.customerEmail} label="نسخ البريد الإلكتروني" className="h-5 w-5" />
          </div>
        </div>
      </div>

      {customer ? (
        <>
          <Link
            to={`/admin/customers/${customer.id}`}
            className="group inline-flex items-center justify-center gap-1 rounded-full border border-beige py-2 text-xs text-gold-deep transition-colors hover:border-gold hover:text-gold"
          >
            عرض ملف العميلة الكامل
            <IconChevronStart className="h-3 w-3 transition-transform duration-200 group-hover:-translate-x-0.5" />
          </Link>

          <div className="grid grid-cols-2 gap-3 text-center text-sm">
            <div className="rounded-[10px] border border-beige bg-cream/40 p-3">
              <p className="font-display text-lg text-ink">{customer.orderCount}</p>
              <p className="mt-0.5 text-[11px] text-ink-faint">الطلبات</p>
            </div>
            <div className="rounded-[10px] border border-beige bg-cream/40 p-3">
              <p className="font-display text-lg text-ink">{formatCurrencyGroups(customer.totalSpent)}</p>
              <p className="mt-0.5 text-[11px] text-ink-faint">إجمالي الإنفاق</p>
            </div>
          </div>

          <CustomerOrderHistoryCard customer={customer} />
        </>
      ) : (
        <p className="rounded-[10px] border border-dashed border-beige bg-cream/30 p-4 text-center text-xs text-ink-faint">
          لا يوجد سجل عميلة مرتبط بهذا البريد بعد.
        </p>
      )}
    </div>
  );
}

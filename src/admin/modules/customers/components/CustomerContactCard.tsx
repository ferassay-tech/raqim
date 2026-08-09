import type { AdminCustomer } from "@/admin/types/customer";
import { CopyIconButton } from "@/admin/components/ui/CopyIconButton";
import { Panel } from "@/admin/components/ui/Panel";

interface CustomerContactCardProps {
  customer: AdminCustomer;
}

export function CustomerContactCard({ customer }: CustomerContactCardProps) {
  return (
    <Panel title="معلومات التواصل">
      <dl className="flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="shrink-0 text-ink-faint">البريد الإلكتروني</dt>
          <dd className="flex min-w-0 items-center gap-1">
            <span className="truncate text-ink" dir="ltr">
              {customer.email}
            </span>
            <CopyIconButton value={customer.email} label="نسخ البريد الإلكتروني" className="h-6 w-6 shrink-0" />
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-faint">عميلة منذ</dt>
          <dd className="text-ink">{customer.firstOrderDate}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-faint">آخر طلب</dt>
          <dd className="text-ink">{customer.lastOrderDate}</dd>
        </div>
      </dl>
    </Panel>
  );
}

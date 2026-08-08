import { Link } from "react-router-dom";
import type { NeedsAttentionSummary } from "@/admin/types/dashboard";
import { DashboardPanel } from "./DashboardPanel";
import { IconBag, IconCheck, IconMail } from "@/admin/icons";

interface NeedsAttentionPanelProps {
  summary: NeedsAttentionSummary;
}

/**
 * The dashboard's primary zone — answers "does this need me right now"
 * before anything else on the page. Distinct from LatestOrdersPanel/
 * LatestMessagesPanel, which show recent activity regardless of state;
 * this shows only what's unresolved.
 */
export function NeedsAttentionPanel({ summary }: NeedsAttentionPanelProps) {
  const { pendingOrders, unreadMessages } = summary;
  const allClear = pendingOrders.count === 0 && unreadMessages.count === 0;

  if (allClear) {
    return (
      <DashboardPanel title="يحتاج انتباهك">
        <div className="flex items-center gap-3 py-1">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-success/10 text-success">
            <IconCheck className="h-4 w-4" />
          </span>
          <p className="text-sm text-ink-soft">كل شيء تحت السيطرة — لا توجد طلبات أو رسائل بانتظارك الآن.</p>
        </div>
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel title="يحتاج انتباهك">
      <div className="flex flex-col gap-5">
        {pendingOrders.count > 0 && (
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <IconBag className="h-4 w-4 text-gold-deep" />
                <p className="text-sm text-ink">{pendingOrders.count.toLocaleString("en-US")} طلب بانتظار المراجعة</p>
              </div>
              <Link to="/admin/orders" className="shrink-0 text-xs text-gold-deep transition-colors hover:text-gold">
                عرض الطلبات
              </Link>
            </div>
            <ul className="mt-3 flex flex-col gap-1">
              {pendingOrders.items.map((order) => (
                <li key={order.id}>
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-cream/50"
                  >
                    <span className="truncate text-ink-soft">{order.customerName}</span>
                    <span className="shrink-0 text-ink-faint">{order.amount}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {unreadMessages.count > 0 && (
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <IconMail className="h-4 w-4 text-gold-deep" />
                <p className="text-sm text-ink">{unreadMessages.count.toLocaleString("en-US")} رسالة غير مقروءة</p>
              </div>
              <Link to="/admin/messages" className="shrink-0 text-xs text-gold-deep transition-colors hover:text-gold">
                عرض الرسائل
              </Link>
            </div>
            <ul className="mt-3 flex flex-col gap-1">
              {unreadMessages.items.map((message) => (
                <li key={message.id}>
                  <Link
                    to={`/admin/messages/${message.id}`}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-cream/50"
                  >
                    <span className="shrink-0 text-ink-soft">{message.sender}</span>
                    <span className="min-w-0 flex-1 truncate text-end text-xs text-ink-faint">{message.snippet}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardPanel>
  );
}

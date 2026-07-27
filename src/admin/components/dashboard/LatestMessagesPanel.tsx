import { Link } from "react-router-dom";
import type { LatestMessage } from "../../types/dashboard";
import { EmptyState } from "../EmptyState";
import { DashboardPanel } from "./DashboardPanel";
import { IconMail } from "../../icons";

interface LatestMessagesPanelProps {
  messages: LatestMessage[];
}

export function LatestMessagesPanel({ messages }: LatestMessagesPanelProps) {
  if (messages.length === 0) {
    return (
      <DashboardPanel title="أحدث الرسائل" viewAllTo="/admin/messages">
        <EmptyState icon={IconMail} title="لا توجد محادثات بعد" description="ستظهر أحدث الرسائل هنا فور ورودها." />
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel title="أحدث الرسائل" viewAllTo="/admin/messages">
      <ul className="flex flex-col divide-y divide-beige">
        {messages.map((message) => (
          <li key={message.id}>
            <Link
              to={`/admin/messages/${message.id}`}
              className="-mx-2 flex items-start gap-3 rounded-lg px-2 py-3.5 transition-colors first:pt-0 last:pb-0 hover:bg-cream/50"
            >
              <span
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                  message.unread ? "bg-gold" : "bg-transparent"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`truncate text-sm ${message.unread ? "text-ink" : "text-ink-soft"}`}>
                    {message.sender}
                  </p>
                  <span className="shrink-0 text-[11px] text-ink-faint">{message.time}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-ink-faint">{message.snippet}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </DashboardPanel>
  );
}

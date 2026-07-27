import type { AdminConversation } from "../../types/message";
import { CustomerAvatar } from "../customers/CustomerAvatar";

interface ConversationListItemProps {
  conversation: AdminConversation;
  active: boolean;
  onClick: () => void;
}

export function ConversationListItem({ conversation, active, onClick }: ConversationListItemProps) {
  const lastMessage = conversation.messages[conversation.messages.length - 1];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 border-b border-beige/70 px-4 py-3.5 text-start transition-colors ${
        active ? "bg-cream" : "hover:bg-cream/50"
      }`}
    >
      <CustomerAvatar name={conversation.customerName} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={`truncate text-sm ${conversation.unread ? "font-medium text-ink" : "text-ink"}`}>
            {conversation.customerName}
          </p>
          <span className="shrink-0 text-[11px] text-ink-faint">{conversation.updatedAt}</span>
        </div>
        <p className={`mt-0.5 truncate text-xs ${conversation.unread ? "text-ink-soft" : "text-ink-faint"}`}>
          {lastMessage?.direction === "note" ? "ملاحظة: " : ""}
          {lastMessage?.body}
        </p>
      </div>
      {conversation.unread && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />}
    </button>
  );
}

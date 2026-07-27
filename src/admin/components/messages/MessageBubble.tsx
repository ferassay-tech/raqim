import type { ConversationMessage } from "../../types/message";

interface MessageBubbleProps {
  message: ConversationMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message.direction === "note") {
    return (
      <div className="mx-auto w-full max-w-lg rounded-[10px] border border-dashed border-gold/40 bg-gold/5 px-4 py-3">
        <p className="text-xs font-medium text-gold-deep">ملاحظة داخلية — {message.author}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{message.body}</p>
        <p className="mt-1.5 text-[11px] text-ink-faint">{message.time}</p>
      </div>
    );
  }

  const isOutbound = message.direction === "outbound";

  return (
    <div className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-[10px] px-4 py-3 ${
          isOutbound ? "bg-ink text-ivory" : "border border-beige bg-white/80 text-ink"
        }`}
      >
        <p className="text-sm leading-relaxed">{message.body}</p>
        <p className={`mt-1.5 text-[11px] ${isOutbound ? "text-cream/60" : "text-ink-faint"}`}>{message.time}</p>
      </div>
    </div>
  );
}

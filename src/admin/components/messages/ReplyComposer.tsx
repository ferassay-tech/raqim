import { useState } from "react";
import type { FormEvent } from "react";
import { IconChevronStart } from "../../icons";

interface ReplyComposerProps {
  onSendReply: (body: string) => void;
  onAddNote: (body: string) => void;
}

type ComposerMode = "reply" | "note";

export function ReplyComposer({ onSendReply, onAddNote }: ReplyComposerProps) {
  const [mode, setMode] = useState<ComposerMode>("reply");
  const [text, setText] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    if (mode === "reply") onSendReply(trimmed);
    else onAddNote(trimmed);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-beige p-4">
      <div className="mb-3 inline-flex rounded-full border border-beige bg-ivory p-1">
        <button
          type="button"
          onClick={() => setMode("reply")}
          className={`rounded-full px-4 py-1.5 text-xs transition-colors ${
            mode === "reply" ? "bg-ink text-ivory" : "text-ink-soft hover:text-ink"
          }`}
        >
          رد للعميلة
        </button>
        <button
          type="button"
          onClick={() => setMode("note")}
          className={`rounded-full px-4 py-1.5 text-xs transition-colors ${
            mode === "note" ? "bg-gold text-ink" : "text-ink-soft hover:text-ink"
          }`}
        >
          ملاحظة داخلية
        </button>
      </div>

      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={mode === "reply" ? "اكتبي ردك هنا..." : "أضيفي ملاحظة يراها فريقك فقط..."}
          rows={2}
          className={`w-full resize-none rounded-[10px] border px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none ${
            mode === "note" ? "border-gold/40 bg-gold/5 focus:border-gold" : "border-beige bg-ivory focus:border-gold"
          }`}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          aria-label="إرسال"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-ivory transition-colors hover:bg-gold-deep disabled:pointer-events-none disabled:opacity-30"
        >
          <IconChevronStart className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

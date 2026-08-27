import { useState } from "react";
import type { FormEvent } from "react";
import { IconChevronStart } from "@/admin/icons";

interface ReplyComposerProps {
  onSendReply: (body: string) => Promise<void>;
  onAddNote: (body: string) => Promise<void>;
}

type ComposerMode = "reply" | "note";
type SubmitStatus = "idle" | "sending" | "error";

// Fixed, user-friendly messages — never the raw thrown error. The real
// error (with conversation-id context) is already logged by
// MessagesContext's sendReply/addNote; a Postgres/Supabase error string
// isn't something a non-technical admin should see.
const ERROR_MESSAGES: Record<ComposerMode, string> = {
  reply: "تعذر إرسال الرد. حاولي مرة أخرى.",
  note: "تعذر حفظ الملاحظة. حاولي مرة أخرى.",
};

export function ReplyComposer({ onSendReply, onAddNote }: ReplyComposerProps) {
  const [mode, setMode] = useState<ComposerMode>("reply");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const isSending = status === "sending";

  const switchMode = (next: ComposerMode) => {
    if (isSending) return;
    setMode(next);
    setStatus("idle");
  };

  const handleTextChange = (value: string) => {
    setText(value);
    if (status === "error") setStatus("idle");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    setStatus("sending");
    try {
      if (mode === "reply") await onSendReply(trimmed);
      else await onAddNote(trimmed);
      setText("");
      setStatus("idle");
    } catch {
      // Text intentionally preserved — the admin can retry without
      // retyping. The real error is already logged where it's thrown.
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-beige p-4">
      <div className="mb-3 inline-flex rounded-full border border-beige bg-ivory p-1">
        <button
          type="button"
          onClick={() => switchMode("reply")}
          disabled={isSending}
          className={`rounded-full px-4 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            mode === "reply" ? "bg-ink text-ivory" : "text-ink-soft hover:text-ink"
          }`}
        >
          رد للعميلة
        </button>
        <button
          type="button"
          onClick={() => switchMode("note")}
          disabled={isSending}
          className={`rounded-full px-4 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            mode === "note" ? "bg-gold text-ink" : "text-ink-soft hover:text-ink"
          }`}
        >
          ملاحظة داخلية
        </button>
      </div>

      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={mode === "reply" ? "اكتبي ردك هنا..." : "أضيفي ملاحظة يراها فريقك فقط..."}
          rows={2}
          disabled={isSending}
          className={`w-full resize-none rounded-md border px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none disabled:opacity-60 ${
            mode === "note" ? "border-gold/40 bg-gold/5 focus:border-gold" : "border-beige bg-ivory focus:border-gold"
          }`}
        />
        <button
          type="submit"
          disabled={!text.trim() || isSending}
          aria-label="إرسال"
          aria-busy={isSending}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-ivory transition-colors hover:bg-gold-deep disabled:pointer-events-none disabled:opacity-30"
        >
          {isSending ? (
            <span
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-ivory/60 border-t-transparent"
            />
          ) : (
            <IconChevronStart className="h-4 w-4" />
          )}
        </button>
      </div>

      {status === "error" && <p className="mt-2 text-xs text-danger">{ERROR_MESSAGES[mode]}</p>}
    </form>
  );
}

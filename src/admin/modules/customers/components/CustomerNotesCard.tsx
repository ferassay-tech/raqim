import { useState } from "react";
import type { FormEvent } from "react";
import { useCustomerNotes } from "@/admin/context/CustomerNotesContext";
import { IconPlus } from "@/admin/icons";

interface CustomerNotesCardProps {
  customerId: string;
}

export function CustomerNotesCard({ customerId }: CustomerNotesCardProps) {
  const { notesFor, addNote } = useCustomerNotes();
  const [text, setText] = useState("");
  const notes = notesFor(customerId);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    addNote(customerId, trimmed);
    setText("");
  };

  return (
    <div className="rounded-[10px] border border-beige bg-white/70 p-6 shadow-(--shadow-soft) backdrop-blur">
      <h2 className="font-display text-lg text-ink">ملاحظات داخلية</h2>

      {notes.length === 0 ? (
        <p className="mt-3 text-sm text-ink-faint">لا توجد ملاحظات بعد.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-[10px] bg-cream/50 p-3.5">
              <p className="text-sm leading-relaxed text-ink-soft">{note.text}</p>
              <p className="mt-1.5 text-xs text-ink-faint">{note.time}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2 border-t border-beige pt-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="أضيفي ملاحظة عن هذه العميلة..."
          className="w-full rounded-full border border-beige bg-ivory px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          aria-label="إضافة ملاحظة"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-ivory transition-colors hover:bg-gold-deep disabled:pointer-events-none disabled:opacity-30"
        >
          <IconPlus className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

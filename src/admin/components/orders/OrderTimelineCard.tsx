import { useState } from "react";
import type { FormEvent } from "react";
import type { AdminOrder } from "../../types/order";
import { Timeline } from "../Timeline";
import { IconPlus } from "../../icons";

interface OrderTimelineCardProps {
  order: AdminOrder;
  onAddNote: (text: string) => void;
}

export function OrderTimelineCard({ order, onAddNote }: OrderTimelineCardProps) {
  const [note, setNote] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = note.trim();
    if (!trimmed) return;
    onAddNote(trimmed);
    setNote("");
  };

  return (
    <div className="rounded-[10px] border border-beige bg-white/70 p-6 shadow-(--shadow-soft) backdrop-blur">
      <h2 className="font-display text-lg text-ink">السجل الزمني</h2>

      <div className="mt-5">
        <Timeline
          items={order.timeline.map((event) => ({
            id: event.id,
            title: event.label,
            time: event.time,
            tone: event.tone,
          }))}
        />
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex items-center gap-2 border-t border-beige pt-5">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="أضيفي ملاحظة داخلية عن هذا الطلب..."
          className="w-full rounded-full border border-beige bg-ivory px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={!note.trim()}
          aria-label="إضافة ملاحظة"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-ivory transition-colors hover:bg-gold-deep disabled:pointer-events-none disabled:opacity-30"
        >
          <IconPlus className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

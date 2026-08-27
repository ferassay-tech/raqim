import { useState } from "react";
import type { FormEvent } from "react";
import type { AdminOrder } from "@/admin/types/order";
import { Timeline } from "@/admin/components/ui/Timeline";
import { IconPlus } from "@/admin/icons";

interface OrderTimelineCardProps {
  order: AdminOrder;
  onAddNote: (text: string) => Promise<void>;
}

export function OrderTimelineCard({ order, onAddNote }: OrderTimelineCardProps) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (value: string) => {
    setNote(value);
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = note.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onAddNote(trimmed);
      setNote("");
      setError(null);
    } catch (err) {
      // Text intentionally preserved — the admin can retry without
      // retyping.
      console.error("Failed to add order note:", err);
      setError("تعذر حفظ الملاحظة. حاولي مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-md border border-beige bg-white/70 p-6 shadow-(--shadow-soft) backdrop-blur">
      <h2 className="font-display text-h2 text-ink">السجل الزمني</h2>

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
          onChange={(e) => handleChange(e.target.value)}
          placeholder="أضيفي ملاحظة داخلية عن هذا الطلب..."
          disabled={isSubmitting}
          className="w-full rounded-full border border-beige bg-ivory px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!note.trim() || isSubmitting}
          aria-label="إضافة ملاحظة"
          aria-busy={isSubmitting}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-ivory transition-colors hover:bg-gold-deep disabled:pointer-events-none disabled:opacity-30"
        >
          {isSubmitting ? (
            <span
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-ivory/60 border-t-transparent"
            />
          ) : (
            <IconPlus className="h-4 w-4" />
          )}
        </button>
      </form>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

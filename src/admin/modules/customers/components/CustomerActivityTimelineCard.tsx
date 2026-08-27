import type { AdminCustomer } from "@/admin/types/customer";
import { Timeline } from "@/admin/components/ui/Timeline";

interface CustomerActivityTimelineCardProps {
  customer: AdminCustomer;
}

/** Flattens every order's own timeline into one narrative, newest order
 * first — each entry prefixed with its order id so the story stays legible
 * once events from different orders sit next to each other. */
export function CustomerActivityTimelineCard({ customer }: CustomerActivityTimelineCardProps) {
  const items = customer.orders.flatMap((order) =>
    order.timeline.map((event) => ({
      id: event.id,
      title: `طلب #${order.id}: ${event.label}`,
      time: event.time,
      tone: event.tone,
    }))
  );

  return (
    <div className="rounded-md border border-beige bg-white/70 p-6 shadow-(--shadow-soft) backdrop-blur">
      <h2 className="font-display text-h2 text-ink">النشاط</h2>
      <div className="mt-4">
        <Timeline items={items} />
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { Reveal } from "@/components/motion-primitives";
import { useBooks } from "@/admin/context/BooksContext";
import { useOrders } from "@/admin/context/OrdersContext";
import { useMessages } from "@/admin/context/MessagesContext";
import {
  deriveBestSellingBook,
  deriveHeroMetrics,
  deriveLatestMessages,
  deriveLatestOrders,
  deriveNeedsAttention,
  deriveSecondaryMetrics,
} from "@/admin/lib/deriveDashboardMetrics";
import { MetricCard } from "@/admin/components/ui/MetricCard";
import { NeedsAttentionPanel } from "../components/NeedsAttentionPanel";
import { LatestOrdersPanel } from "../components/LatestOrdersPanel";
import { BestSellingBookPanel } from "../components/BestSellingBookPanel";
import { LatestMessagesPanel } from "../components/LatestMessagesPanel";
import { RecentActivityPanel } from "../components/RecentActivityPanel";

const TODAY = new Intl.DateTimeFormat("ar", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
}).format(new Date());

export default function DashboardPage() {
  const { books: allBooks } = useBooks();
  const { orders } = useOrders();
  const { conversations } = useMessages();

  // Soft-deleted books are excluded from every dashboard number — they're
  // no longer part of the real catalog, just recoverable from the trash view.
  const books = useMemo(() => allBooks.filter((b) => b.deletedAt === null), [allBooks]);

  const needsAttention = useMemo(() => deriveNeedsAttention(orders, conversations), [orders, conversations]);
  const heroMetrics = useMemo(() => deriveHeroMetrics(orders, books), [orders, books]);
  const secondaryMetrics = useMemo(() => deriveSecondaryMetrics(books), [books]);
  const bestSellingBook = useMemo(() => deriveBestSellingBook(books, orders), [books, orders]);
  const latestOrders = useMemo(() => deriveLatestOrders(orders), [orders]);
  const latestMessages = useMemo(() => deriveLatestMessages(conversations), [conversations]);

  return (
    <div className="flex flex-col gap-10 py-2">
      <Reveal>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl text-ink">لوحة التحكم</h1>
            <p className="mt-1.5 text-sm text-ink-soft">
              مرحبًا بعودتك، إليك نظرة سريعة على أداء رقيم اليوم.
            </p>
          </div>
          <p className="text-xs text-ink-faint">{TODAY}</p>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <NeedsAttentionPanel summary={needsAttention} />
      </Reveal>

      {/* Secondary zone — hero + secondary metrics are one "how is business
          doing" reading, grouped with a tighter internal gap than the space
          between zones, and arriving together rather than as two staggered
          reveals. */}
      <Reveal delay={0.1}>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {heroMetrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} variant="hero" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {secondaryMetrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} variant="compact" />
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LatestOrdersPanel orders={latestOrders} />
          </div>
          <div className="flex flex-col gap-5">
            <BestSellingBookPanel book={bestSellingBook} />
            <LatestMessagesPanel messages={latestMessages} />
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <RecentActivityPanel items={[]} />
      </Reveal>
    </div>
  );
}

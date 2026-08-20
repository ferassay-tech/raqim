import { useEffect, useMemo } from "react";
import { Reveal } from "@/components/motion-primitives";
import { useBooks } from "@/admin/context/BooksContext";
import { useOrders } from "@/admin/context/OrdersContext";
import { isActiveOrder } from "@/admin/types/order";
import { useMessages } from "@/admin/context/MessagesContext";
import {
  deriveBestSellingBook,
  deriveHeroMetrics,
  deriveLatestMessages,
  deriveLatestOrders,
  deriveNeedsAttention,
  derivePublishingPipeline,
  deriveSecondaryMetrics,
} from "@/admin/lib/deriveDashboardMetrics";
import { MetricCard } from "@/admin/components/ui/MetricCard";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { Panel } from "@/admin/components/ui/Panel";
import { NeedsAttentionPanel } from "../components/NeedsAttentionPanel";
import { LatestOrdersPanel } from "../components/LatestOrdersPanel";
import { PublishingPanel } from "../components/PublishingPanel";
import { LatestMessagesPanel } from "../components/LatestMessagesPanel";

const TODAY = new Intl.DateTimeFormat("ar", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
}).format(new Date());

/**
 * The Dashboard as a workflow, not a list of workspaces: one hero (what
 * needs me right now), one calm business reading, one independent
 * publishing check, then two quiet recent-activity feeds. Every step maps
 * to a real question the administrator asks during the day, in that order
 * — nothing here competes with Work Start for attention.
 */
export default function DashboardPage() {
  const { books: allBooks } = useBooks();
  const { orders, reload } = useOrders();
  const { conversations } = useMessages();

  // OrdersContext fetches once per session and doesn't otherwise know a
  // customer created a new order in a separate browser — refetch every
  // time this page is actually navigated to, so "Latest Orders"/"Needs
  // Attention" reflect the current database rather than whatever was
  // fetched at login. No visual change; purely a data-freshness effect.
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Soft-deleted books are excluded from every dashboard number — they're
  // no longer part of the real catalog, just recoverable from the trash view.
  const books = useMemo(() => allBooks.filter((b) => b.deletedAt === null), [allBooks]);
  // Same treatment for trashed orders — Trash is a business-state view, not
  // part of "what's happening today," so it must not inflate revenue,
  // order counts, Latest Orders, Needs Attention, or the customer count.
  const activeOrders = useMemo(() => orders.filter(isActiveOrder), [orders]);

  const needsAttention = useMemo(
    () => deriveNeedsAttention(activeOrders, conversations),
    [activeOrders, conversations]
  );
  const heroMetrics = useMemo(() => deriveHeroMetrics(activeOrders, books), [activeOrders, books]);
  const secondaryMetrics = useMemo(() => deriveSecondaryMetrics(books), [books]);
  const publishingPipeline = useMemo(() => derivePublishingPipeline(books), [books]);
  const bestSellingBook = useMemo(() => deriveBestSellingBook(books, activeOrders), [books, activeOrders]);
  const latestOrders = useMemo(() => deriveLatestOrders(activeOrders), [activeOrders]);
  const latestMessages = useMemo(() => deriveLatestMessages(conversations), [conversations]);

  const booksMetric = secondaryMetrics.find((m) => m.id === "books")!;

  return (
    <div className="flex flex-col pt-8 pb-2">
      {/* 1. Header — welcome and date, nothing else. */}
      <Reveal>
        <PageHeader
          title="لوحة التحكم"
          description="مرحبًا بعودتك، إليك نظرة سريعة على أداء رقيم اليوم."
          actions={<p className="text-xs text-ink-faint">{TODAY}</p>}
        />
      </Reveal>

      {/* 2. Work Start (Level 1) — the only hero on the page: what requires
          action right now. 3. Business Snapshot (Level 2) sits beside it —
          a calm reading, not a competing hero. */}
      <Reveal delay={0.05} className="mt-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2">
            <WorkspaceHeader title="الانتباه" />
            <div className="mt-4">
              <NeedsAttentionPanel summary={needsAttention} />
            </div>
          </div>

          <div>
            <WorkspaceHeader title="صحة العمل" />
            <div className="mt-4">
              <Panel weight="secondary">
                <ul className="flex flex-col divide-y divide-beige">
                  {heroMetrics.map((metric) => (
                    <li key={metric.id} className="py-5 first:pt-0 last:pb-0">
                      <MetricCard metric={metric} variant="row" />
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 4. Publishing (Level 2) — internal work, independent from Work
          Start's external orders/messages. Its own title + "view all" link
          already identify it, so no separate eyebrow label repeats above it. */}
      <Reveal delay={0.15} className="mt-12">
        <PublishingPanel pipeline={publishingPipeline} book={bestSellingBook} bookCountLabel={booksMetric.value} />
      </Reveal>

      {/* 5. Recent Orders — a quiet chronological feed, not another
          workspace: what happened recently, nothing more. */}
      <Reveal delay={0.2} className="mt-12">
        <LatestOrdersPanel orders={latestOrders} />
      </Reveal>

      {/* 6. Recent Messages — same philosophy. */}
      <Reveal delay={0.25} className="mt-12">
        <LatestMessagesPanel messages={latestMessages} />
      </Reveal>
    </div>
  );
}

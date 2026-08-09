import type { OrderStatus } from "./order";

export type TrendDirection = "up" | "down" | "flat";

export interface Trend {
  direction: TrendDirection;
  value: string;
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  /** Absent when there isn't enough historical data yet to compute a trend. */
  trend?: Trend;
  caption: string;
  chart?: number[];
}

export interface LatestOrder {
  id: string;
  customerName: string;
  amount: string;
  status: OrderStatus;
  time: string;
}

export interface LatestMessage {
  id: string;
  sender: string;
  snippet: string;
  time: string;
  unread: boolean;
}

export interface BestSellingBook {
  title: string;
  cover: string | null;
  unitsSold: number;
  revenue: string;
  shareOfSales: number;
}

export interface NeedsAttentionItem {
  id: string;
  kind: "order" | "message";
  title: string;
  detail: string;
  time: string;
  href: string;
}

export interface NeedsAttentionSummary {
  lead: NeedsAttentionItem | null;
  rest: NeedsAttentionItem[];
}

export interface PublishingPipelineItem {
  id: string;
  title: string;
  updatedAt: string;
  href: string;
}

export interface PublishingPipelineSummary {
  /** The oldest draft currently being edited, by last-updated time — not a
   * judgment about neglect, just the one that's gone longest untouched. */
  lead: PublishingPipelineItem | null;
  /** Other drafts beyond the lead — mentioned, never enumerated. */
  remainingCount: number;
}

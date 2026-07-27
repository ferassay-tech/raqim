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

export interface ActivityItem {
  id: string;
  text: string;
  time: string;
}

export interface BestSellingBook {
  title: string;
  cover: string | null;
  unitsSold: number;
  revenue: string;
  shareOfSales: number;
}

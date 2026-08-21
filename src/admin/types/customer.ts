import type { AdminOrder, CurrencyGroupedAmount } from "./order";
import type { StatusBadgeVariant } from "../components/ui/StatusBadge";

export type CustomerSegment = "new" | "returning";

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  /** Newest first. */
  orders: AdminOrder[];
  orderCount: number;
  /** Sum of paid orders only — cancelled/refunded orders never became real
   * revenue. Grouped by currency (never blended into one number — RAQIM's
   * USD/EGP/ILS prices are independent with no FX conversion, see the A1
   * remediation plan); a customer who paid in more than one currency gets
   * one entry per currency here. */
  totalSpent: CurrencyGroupedAmount[];
  /** Same per-currency grouping as totalSpent — each entry's `amount` is
   * that currency's average (its `amount` from totalSpent divided by its
   * own `count`), never a blended cross-currency average. */
  averageOrderValue: CurrencyGroupedAmount[];
  firstOrderDate: string;
  lastOrderDate: string;
  favoriteCategory: string | null;
  segment: CustomerSegment;
}

export const CUSTOMER_SEGMENT_META: Record<CustomerSegment, { label: string; variant: StatusBadgeVariant }> = {
  returning: { label: "عميلة دائمة", variant: "success" },
  new: { label: "عميلة جديدة", variant: "info" },
};

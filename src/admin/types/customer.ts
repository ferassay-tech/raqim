import type { AdminOrder } from "./order";
import type { StatusBadgeVariant } from "../components/ui/StatusBadge";

export type CustomerSegment = "new" | "returning";

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  /** Newest first. */
  orders: AdminOrder[];
  orderCount: number;
  /** Sum of paid orders only — cancelled/refunded orders never became real revenue. */
  totalSpent: number;
  averageOrderValue: number;
  firstOrderDate: string;
  lastOrderDate: string;
  favoriteCategory: string | null;
  segment: CustomerSegment;
}

export const CUSTOMER_SEGMENT_META: Record<CustomerSegment, { label: string; variant: StatusBadgeVariant }> = {
  returning: { label: "عميلة دائمة", variant: "success" },
  new: { label: "عميلة جديدة", variant: "info" },
};

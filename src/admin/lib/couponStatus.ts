import type { AdminCoupon, CouponStatus } from "../types/coupon";
import type { StatusBadgeVariant } from "../components/ui/StatusBadge";

export const COUPON_STATUS_META: Record<CouponStatus, { label: string; variant: StatusBadgeVariant }> = {
  active: { label: "نشط", variant: "success" },
  scheduled: { label: "مجدول", variant: "info" },
  expired: { label: "منتهي", variant: "neutral" },
  exhausted: { label: "نفدت الكمية", variant: "warning" },
  disabled: { label: "متوقف", variant: "neutral" },
};

/** Status is computed, not stored — a coupon's usability depends on today's
 * date and its usage count, not just an "enabled" flag someone set once. */
export function getCouponStatus(coupon: AdminCoupon, today = new Date()): CouponStatus {
  if (!coupon.enabled) return "disabled";
  if (coupon.expiresAt && new Date(coupon.expiresAt) < today) return "expired";
  if (coupon.startsAt && new Date(coupon.startsAt) > today) return "scheduled";
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) return "exhausted";
  return "active";
}

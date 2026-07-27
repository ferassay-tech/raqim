export type CouponType = "percentage" | "fixed";

export interface AdminCoupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderValue: number | null;
  usageLimit: number | null;
  usageCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  enabled: boolean;
  description: string;
}

/** Presentation-only — the actual "is this coupon usable" logic lives in
 * lib/couponStatus.ts, since it depends on today's date and usage, not just
 * the stored record. */
export type CouponStatus = "active" | "scheduled" | "expired" | "exhausted" | "disabled";

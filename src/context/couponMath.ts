import type { AdminCoupon } from "../admin/types/coupon";

export interface AppliedCoupon {
  code: string;
  type: AdminCoupon["type"];
  value: number;
}

/** Rounds to cents — coupons apply to a currency amount, never a fractional cent. */
export function computeDiscountedPrice(price: number, coupon: AppliedCoupon | null): number {
  if (!coupon) return price;
  const discounted = coupon.type === "percentage" ? price * (1 - coupon.value / 100) : price - coupon.value;
  return Math.max(0, Math.round(discounted * 100) / 100);
}

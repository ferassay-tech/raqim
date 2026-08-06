import type { AdminCoupon, CouponType } from "../types/coupon";
import { createCollectionAdapter } from "../services/data/index.ts";
import type { CollectionAdapter } from "../services/data/index.ts";

/**
 * CMS Phase 6D — repository for coupons. Not wired into CouponsContext
 * yet. Unlike orders, checkout never writes here (only reads the list to
 * validate a code), so this is a plain generic-adapter repository with no
 * divergence from the Books/Media/Library pattern.
 */

export interface CouponRow {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  min_order_value: number | null;
  usage_limit: number | null;
  usage_count: number;
  starts_at: string | null;
  expires_at: string | null;
  enabled: boolean;
  description: string;
}

export function couponToSupabaseRow(coupon: AdminCoupon): CouponRow {
  return {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    min_order_value: coupon.minOrderValue,
    usage_limit: coupon.usageLimit,
    usage_count: coupon.usageCount,
    starts_at: coupon.startsAt,
    expires_at: coupon.expiresAt,
    enabled: coupon.enabled,
    description: coupon.description,
  };
}

export function couponFromSupabaseRow(row: CouponRow): AdminCoupon {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: row.value,
    minOrderValue: row.min_order_value,
    usageLimit: row.usage_limit,
    usageCount: row.usage_count,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    enabled: row.enabled,
    description: row.description,
  };
}

export const couponsRepository: CollectionAdapter<CouponRow> = createCollectionAdapter<CouponRow>(
  "supabase",
  "coupons",
  []
);

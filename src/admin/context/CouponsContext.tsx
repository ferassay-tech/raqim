import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AdminCoupon } from "../types/coupon";
import { INITIAL_COUPONS } from "../data/couponsData";
import { couponFromSupabaseRow, couponToSupabaseRow, couponsRepository } from "./couponsRepository.ts";

interface CouponsContextValue {
  coupons: AdminCoupon[];
  createCoupon: (values: Omit<AdminCoupon, "id" | "usageCount">) => void;
  updateCoupon: (id: string, values: Omit<AdminCoupon, "id" | "usageCount">) => void;
  deleteCoupon: (id: string) => void;
}

const CouponsContext = createContext<CouponsContextValue | null>(null);

/**
 * Coupons, backed by the Supabase `coupons` table since Phase 6D. Unlike
 * Orders, no auth-gating is needed on the mount-fetch: checkout (public,
 * unauthenticated) genuinely needs the live list to validate a code, and
 * coupons_select_anon permits that.
 */
export function CouponsProvider({ children }: { children: ReactNode }) {
  const [coupons, setCoupons] = useState<AdminCoupon[]>(INITIAL_COUPONS);

  useEffect(() => {
    let cancelled = false;
    couponsRepository
      .list()
      .then((rows) => {
        if (cancelled) return;
        setCoupons(rows.map(couponFromSupabaseRow));
      })
      .catch((error) => {
        console.error("Failed to load coupons from Supabase:", error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const createCoupon = useCallback((values: Omit<AdminCoupon, "id" | "usageCount">) => {
    const coupon: AdminCoupon = { ...values, id: `cp-${Date.now()}`, usageCount: 0 };
    void couponsRepository
      .create(couponToSupabaseRow(coupon))
      .then(() => {
        setCoupons((prev) => [...prev, coupon]);
      })
      .catch((error) => {
        console.error("Failed to create coupon:", error);
      });
  }, []);

  const updateCoupon = useCallback((id: string, values: Omit<AdminCoupon, "id" | "usageCount">) => {
    void couponsRepository
      .update(id, {
        code: values.code,
        type: values.type,
        value: values.value,
        min_order_value: values.minOrderValue,
        usage_limit: values.usageLimit,
        starts_at: values.startsAt,
        expires_at: values.expiresAt,
        enabled: values.enabled,
        description: values.description,
      })
      .then(() => {
        setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...values } : c)));
      })
      .catch((error) => {
        console.error("Failed to update coupon:", error);
      });
  }, []);

  const deleteCoupon = useCallback((id: string) => {
    void couponsRepository
      .remove(id)
      .then(() => {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      })
      .catch((error) => {
        console.error("Failed to delete coupon:", error);
      });
  }, []);

  const value = useMemo(
    () => ({ coupons, createCoupon, updateCoupon, deleteCoupon }),
    [coupons, createCoupon, updateCoupon, deleteCoupon]
  );

  return <CouponsContext.Provider value={value}>{children}</CouponsContext.Provider>;
}

export function useCoupons() {
  const ctx = useContext(CouponsContext);
  if (!ctx) throw new Error("useCoupons must be used within CouponsProvider");
  return ctx;
}

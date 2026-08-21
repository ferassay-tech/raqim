import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AdminCoupon } from "../types/coupon";
import { INITIAL_COUPONS } from "../data/couponsData";
import { couponFromSupabaseRow, couponToSupabaseRow, couponsRepository } from "./couponsRepository.ts";

interface CouponsContextValue {
  coupons: AdminCoupon[];
  createCoupon: (values: Omit<AdminCoupon, "id" | "usageCount">) => Promise<void>;
  updateCoupon: (id: string, values: Omit<AdminCoupon, "id" | "usageCount">) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  loadError: string | null;
  reload: () => void;
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    couponsRepository
      .list()
      .then((rows) => {
        if (cancelled) return;
        setCoupons(rows.map(couponFromSupabaseRow));
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load coupons from Supabase:", error);
        setLoadError("تعذر تحميل أكواد الخصم من الخادم.");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const createCoupon = useCallback(async (values: Omit<AdminCoupon, "id" | "usageCount">) => {
    const coupon: AdminCoupon = { ...values, id: `cp-${Date.now()}`, usageCount: 0 };
    await couponsRepository.create(couponToSupabaseRow(coupon));
    setCoupons((prev) => [...prev, coupon]);
  }, []);

  const updateCoupon = useCallback(async (id: string, values: Omit<AdminCoupon, "id" | "usageCount">) => {
    await couponsRepository.update(id, {
      code: values.code,
      type: values.type,
      value: values.value,
      min_order_value: values.minOrderValue,
      usage_limit: values.usageLimit,
      starts_at: values.startsAt,
      expires_at: values.expiresAt,
      enabled: values.enabled,
      description: values.description,
    });
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...values } : c)));
  }, []);

  const deleteCoupon = useCallback(async (id: string) => {
    await couponsRepository.remove(id);
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = useMemo(
    () => ({ coupons, createCoupon, updateCoupon, deleteCoupon, loadError, reload }),
    [coupons, createCoupon, updateCoupon, deleteCoupon, loadError, reload]
  );

  return <CouponsContext.Provider value={value}>{children}</CouponsContext.Provider>;
}

export function useCoupons() {
  const ctx = useContext(CouponsContext);
  if (!ctx) throw new Error("useCoupons must be used within CouponsProvider");
  return ctx;
}

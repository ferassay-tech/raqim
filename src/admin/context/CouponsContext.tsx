import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { AdminCoupon } from "../types/coupon";
import { INITIAL_COUPONS } from "../data/couponsData";
import { usePersistedState } from "../lib/usePersistedState";

interface CouponsContextValue {
  coupons: AdminCoupon[];
  createCoupon: (values: Omit<AdminCoupon, "id" | "usageCount">) => void;
  updateCoupon: (id: string, values: Omit<AdminCoupon, "id" | "usageCount">) => void;
  deleteCoupon: (id: string) => void;
}

const CouponsContext = createContext<CouponsContextValue | null>(null);

export function CouponsProvider({ children }: { children: ReactNode }) {
  const [coupons, setCoupons] = usePersistedState<AdminCoupon[]>("coupons", INITIAL_COUPONS);

  const createCoupon = useCallback((values: Omit<AdminCoupon, "id" | "usageCount">) => {
    setCoupons((prev) => [...prev, { ...values, id: `cp-${Date.now()}`, usageCount: 0 }]);
  }, [setCoupons]);

  const updateCoupon = useCallback((id: string, values: Omit<AdminCoupon, "id" | "usageCount">) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...values } : c)));
  }, [setCoupons]);

  const deleteCoupon = useCallback((id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  }, [setCoupons]);

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

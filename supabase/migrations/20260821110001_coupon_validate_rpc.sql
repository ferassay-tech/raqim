-- Phase 1 security hardening, Finding 6: coupons_select_anon currently
-- grants unrestricted `using (true)` SELECT to anon (confirmed live —
-- 20260806170001_coupons_table.sql created it that way, and
-- 20260818240001_coupons_permission_aware_rls.sql only narrowed its `to`
-- role list to anon-only, never touched the USING clause). Any anonymous
-- visitor's browser can currently fetch every coupons row in full —
-- including disabled/scheduled/expired ones and internal usage_count/
-- usage_limit/min_order_value/description — via a plain PostgREST
-- select("*"), independent of what the frontend code happens to call.
--
-- Traced the real need first: CheckoutPage.tsx (public, unauthenticated)
-- only ever validates the one code a customer typed and, on success,
-- needs {code, type, value} for computeDiscountedPrice() — confirmed via
-- src/context/couponMath.ts (AppliedCoupon has no other fields) and
-- src/admin/lib/couponStatus.ts's getCouponStatus() (the exact eligibility
-- rule being reproduced server-side below: enabled, starts_at, expires_at,
-- usage_limit vs usage_count). min_order_value is stored but not read by
-- checkout anywhere today (grepped: only the admin coupon form uses it) —
-- correctly left out of what this function returns.
--
-- This migration is purely additive: no existing coupon row is touched,
-- no admin-facing policy/behavior changes (coupons_select_permission,
-- insert/update/delete policies, and the CouponsPage admin UI are
-- untouched), and no migration is edited or dropped. It adds one new
-- SECURITY DEFINER function that looks up a single row by code and
-- returns only the fields checkout consumes, then removes the anon
-- policy that made the whole-table read possible in the first place —
-- closing the exposure at its actual source (RLS + PostgREST), not just
-- routing the frontend around it while leaving the open door in place.
create or replace function public.validate_coupon_code(p_code text)
returns table (code text, type text, value numeric, is_valid boolean)
language sql
security definer
set search_path = public
stable
as $$
  select
    c.code,
    c.type,
    c.value,
    (
      c.enabled
      and (c.starts_at is null or c.starts_at <= current_date)
      and (c.expires_at is null or c.expires_at >= current_date)
      and (c.usage_limit is null or c.usage_count < c.usage_limit)
    ) as is_valid
  from public.coupons c
  where upper(c.code) = upper(p_code)
  limit 1
$$;

revoke all on function public.validate_coupon_code(text) from public;
grant execute on function public.validate_coupon_code(text) to anon, authenticated;

drop policy coupons_select_anon on public.coupons;

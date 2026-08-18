-- Backend authorization hardening, table 4 of N: public.coupons.
-- Same approach approved and applied for public.books (20260818210001),
-- public.articles (20260818220001), and public.categories
-- (20260818230001) — single existing permission key, coupons.manage,
-- confirmed live in role_permissions granted to admin + super_admin only
-- (NOT editor). No coupons.view/.create/.edit/.delete exist and none are
-- created here.
--
-- Confirmed and explicitly accepted: unlike categories.manage (also
-- granted to editor), coupons.manage narrows editor's access compared to
-- today's hardcoded current_admin_role() = ANY('editor','owner') check —
-- editor loses coupon-management RLS access, matching the real permission
-- seed instead of the pre-Phase-1 role model. role_permissions and
-- user_permission_overrides are not modified.
--
-- Confirmed live (read-only) before writing this file: public.coupons has
-- exactly four policies, none carrying any business-rule condition beyond
-- the role check, and zero user_permission_overrides rows match
-- coupons.%. Scoped to public.coupons only.

alter policy coupons_select_anon on public.coupons
  to anon;

create policy coupons_select_permission
  on public.coupons
  for select
  to authenticated
  using (has_permission('coupons.manage'));

alter policy coupons_insert_editor_or_owner on public.coupons
  with check (has_permission('coupons.manage'));

alter policy coupons_update_editor_or_owner on public.coupons
  using (has_permission('coupons.manage'))
  with check (has_permission('coupons.manage'));

alter policy coupons_delete_owner on public.coupons
  using (has_permission('coupons.manage'));

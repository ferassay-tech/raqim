-- Backend authorization hardening, table 3 of N: public.categories.
-- Same approach approved and applied for public.books (20260818210001)
-- and public.articles (20260818220001) — with one confirmed difference:
-- categories has only ONE permission key in the vocabulary
-- (categories.manage, granted to editor/admin/super_admin), not four
-- separate .view/.create/.edit/.delete keys. Those four keys do not exist
-- in role_permissions and are NOT created here — has_permission('categories.manage')
-- is used for all four operations.
--
-- Confirmed live (read-only) before writing this file: public.categories
-- has exactly four policies, none carrying any business-rule condition
-- beyond the role check, and zero user_permission_overrides rows match
-- categories.%. Scoped to public.categories only.

alter policy categories_select_anon on public.categories
  to anon;

create policy categories_select_permission
  on public.categories
  for select
  to authenticated
  using (has_permission('categories.manage'));

alter policy categories_insert_editor_or_owner on public.categories
  with check (has_permission('categories.manage'));

alter policy categories_update_editor_or_owner on public.categories
  using (has_permission('categories.manage'))
  with check (has_permission('categories.manage'));

alter policy categories_delete_owner on public.categories
  using (has_permission('categories.manage'));

-- Backend authorization hardening, table 5 of N: public.media_assets.
-- Same approach approved and applied for public.books (20260818210001),
-- public.articles (20260818220001), public.categories (20260818230001),
-- and public.coupons (20260818240001) — single existing permission key,
-- media.manage, confirmed live in role_permissions granted to editor,
-- admin, and super_admin (unlike coupons.manage, editor's access is
-- preserved here, not narrowed). No media.view/.create/.edit/.delete
-- exist and none are created here.
--
-- Confirmed live (read-only) before writing this file: public.media_assets
-- has exactly four policies, none carrying any business-rule condition
-- beyond the role check, and zero user_permission_overrides rows match
-- media.%. Scoped to public.media_assets only — public.media_folders is a
-- separate table and is not touched by this migration.

alter policy media_assets_select_anon on public.media_assets
  to anon;

create policy media_assets_select_permission
  on public.media_assets
  for select
  to authenticated
  using (has_permission('media.manage'));

alter policy media_assets_insert_editor_or_owner on public.media_assets
  with check (has_permission('media.manage'));

alter policy media_assets_update_editor_or_owner on public.media_assets
  using (has_permission('media.manage'))
  with check (has_permission('media.manage'));

alter policy media_assets_delete_owner on public.media_assets
  using (has_permission('media.manage'));

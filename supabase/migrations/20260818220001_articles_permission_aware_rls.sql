-- Backend authorization hardening, table 2 of N: public.articles.
-- Exact same approach approved and applied for public.books
-- (20260818210001) — has_permission('articles.*') replaces the hardcoded
-- current_admin_role() = ANY(ARRAY['editor','owner']) / = 'owner' checks.
-- Scoped to public.articles only; no other table, RPC, role, or data
-- touched.
--
-- Confirmed live (read-only, before writing this file): public.articles
-- has exactly four policies and no others, none carrying any other
-- business-rule condition beyond the role check:
--   articles_select_anon            SELECT  {anon,authenticated}  qual=true
--   articles_insert_editor_or_owner INSERT  {authenticated}       with_check=current_admin_role()=ANY('editor','owner')
--   articles_update_editor_or_owner UPDATE  {authenticated}       qual/with_check=current_admin_role()=ANY('editor','owner')
--   articles_delete_owner           DELETE  {authenticated}       qual=current_admin_role()='owner'
-- Also confirmed: articles.view/.create/.edit/.delete all exist in
-- role_permissions (view/create/edit granted to editor+admin+super_admin;
-- delete granted to admin+super_admin only, not editor — unchanged by
-- this migration, it's just what has_permission() will now honor instead
-- of the old owner-only delete check). Zero existing
-- user_permission_overrides rows reference any articles.* permission.
--
-- SELECT: articles_select_anon currently grants unconditional SELECT to
-- BOTH anon and authenticated — same structural shape as books before its
-- fix. Narrowed to {anon} only (ALTER POLICY ... TO anon — name, command,
-- and `using (true)` untouched) with a new articles_select_permission
-- policy taking over SELECT for authenticated, gated on
-- has_permission('articles.view'). Public storefront reads are completely
-- unaffected: articles_select_anon still unconditionally allows anon
-- SELECT, exactly as before.

alter policy articles_select_anon on public.articles
  to anon;

create policy articles_select_permission
  on public.articles
  for select
  to authenticated
  using (has_permission('articles.view'));

alter policy articles_insert_editor_or_owner on public.articles
  with check (has_permission('articles.create'));

alter policy articles_update_editor_or_owner on public.articles
  using (has_permission('articles.edit'))
  with check (has_permission('articles.edit'));

alter policy articles_delete_owner on public.articles
  using (has_permission('articles.delete'));

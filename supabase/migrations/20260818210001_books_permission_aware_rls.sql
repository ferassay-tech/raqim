-- Backend authorization hardening, table 1 of N: public.books.
-- Replaces the hardcoded pre-Phase-1 two-role check
-- (current_admin_role() = ANY(ARRAY['editor','owner']) / = 'owner') with
-- has_permission('books.*') — the function verified live in the previous
-- phase. Scoped to public.books only; no other table, RPC, role, or data
-- touched.
--
-- Confirmed live (read-only, before writing this file) that public.books
-- has exactly four policies and no others:
--   books_select_anon              SELECT  {anon,authenticated}  qual=true
--   books_insert_editor_or_owner   INSERT  {authenticated}       with_check=current_admin_role()=ANY('editor','owner')
--   books_update_editor_or_owner   UPDATE  {authenticated}       qual/with_check=current_admin_role()=ANY('editor','owner')
--   books_delete_owner             DELETE  {authenticated}       qual=current_admin_role()='owner'
-- None of the three admin policies carry any other business-rule
-- condition, so none is invented or added here.
--
-- SELECT needed a real design decision (confirmed with the owner): the
-- existing books_select_anon already grants unconditional SELECT to BOTH
-- anon and authenticated. Adding a permission-gated policy for
-- authenticated alongside an unchanged books_select_anon would have no
-- effect (permissive RLS policies are OR'd — the least-restrictive one
-- wins), so books_select_anon's role list is narrowed to {anon} only
-- (ALTER POLICY ... TO anon — its name, command, and `using (true)` are
-- untouched) and a new books_select_permission policy takes over SELECT
-- for authenticated, gated on has_permission('books.view'). Public
-- storefront reads are completely unaffected: books_select_anon still
-- unconditionally allows anon SELECT, exactly as before.

alter policy books_select_anon on public.books
  to anon;

create policy books_select_permission
  on public.books
  for select
  to authenticated
  using (has_permission('books.view'));

alter policy books_insert_editor_or_owner on public.books
  with check (has_permission('books.create'));

alter policy books_update_editor_or_owner on public.books
  using (has_permission('books.edit'))
  with check (has_permission('books.edit'));

alter policy books_delete_owner on public.books
  using (has_permission('books.delete'));

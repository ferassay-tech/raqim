-- Backend authorization hardening, table 7 of N: public.library_files.
-- Single existing key library.manage, confirmed live granted to admin and
-- super_admin only (NOT editor) — same editor-narrowing situation already
-- established and accepted for public.coupons (20260818240001). No
-- business-rule predicate exists on any of the four confirmed-live
-- policies beyond the role check.

alter policy library_files_select_anon on public.library_files
  to anon;

create policy library_files_select_permission
  on public.library_files
  for select
  to authenticated
  using (has_permission('library.manage'));

alter policy library_files_insert_editor_or_owner on public.library_files
  with check (has_permission('library.manage'));

alter policy library_files_update_editor_or_owner on public.library_files
  using (has_permission('library.manage'))
  with check (has_permission('library.manage'));

alter policy library_files_delete_owner on public.library_files
  using (has_permission('library.manage'));

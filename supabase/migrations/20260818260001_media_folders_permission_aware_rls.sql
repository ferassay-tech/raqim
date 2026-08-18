-- Backend authorization hardening, table 6 of N: public.media_folders.
-- Identical shape and permission to public.media_assets (20260818250001):
-- single existing key media.manage (editor, admin, super_admin) covers
-- the whole module including delete. No business-rule predicate exists
-- on any of the four confirmed-live policies beyond the role check.

alter policy media_folders_select_anon on public.media_folders
  to anon;

create policy media_folders_select_permission
  on public.media_folders
  for select
  to authenticated
  using (has_permission('media.manage'));

alter policy media_folders_insert_editor_or_owner on public.media_folders
  with check (has_permission('media.manage'));

alter policy media_folders_update_editor_or_owner on public.media_folders
  using (has_permission('media.manage'))
  with check (has_permission('media.manage'));

alter policy media_folders_delete_owner on public.media_folders
  using (has_permission('media.manage'));

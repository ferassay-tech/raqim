-- Backend authorization hardening, table 12 of N: storage.objects.
-- Confirmed live before writing this file: 6 policies total.
--
-- library_bucket_admin_only currently checks current_admin_role() IS NOT
-- NULL — ANY active admin of any role, not permission-aware at all
-- (flagged VULNERABLE in the original audit). Replaced with
-- has_permission('library.manage'), AND-combined with the existing
-- bucket_id = 'library' scoping condition, which is preserved exactly.
--
-- media_bucket_insert_admin_only / media_bucket_update_admin_only: same
-- "any active admin" pattern, replaced with has_permission('media.manage'),
-- bucket_id = 'media' preserved exactly.
--
-- media_bucket_delete_owner currently checks current_admin_role() =
-- 'owner' (bucket_id = 'media'). Widened to has_permission('media.manage')
-- for consistency with public.media_assets' own delete policy
-- (20260818250001), which already widened from owner-only to
-- media.manage — otherwise an editor could delete the media_assets
-- database row but not the underlying storage object, an inconsistent
-- state.
--
-- media_bucket_select_public (bucket_id = 'media', roles {anon,authenticated},
-- no role check at all — public site images) is deliberately NOT touched:
-- genuinely public, not part of the legacy admin-role pattern.
--
-- uploads_bucket_admin_only (bucket_id = 'uploads', current_admin_role()
-- IS NOT NULL) is deliberately NOT touched: it is a generic private
-- staging bucket not tied to one specific existing permission key: no
-- uploads.* permission exists, and it is not exclusively used by one
-- audited module. Inventing a permission mapping for it would violate
-- the explicit "do not invent permission keys" rule for this hardening
-- effort — left as-is and reported as an open item.

alter policy library_bucket_admin_only on storage.objects
  using (bucket_id = 'library' and has_permission('library.manage'))
  with check (bucket_id = 'library' and has_permission('library.manage'));

alter policy media_bucket_insert_admin_only on storage.objects
  with check (bucket_id = 'media' and has_permission('media.manage'));

alter policy media_bucket_update_admin_only on storage.objects
  using (bucket_id = 'media' and has_permission('media.manage'))
  with check (bucket_id = 'media' and has_permission('media.manage'));

alter policy media_bucket_delete_owner on storage.objects
  using (bucket_id = 'media' and has_permission('media.manage'));

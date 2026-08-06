-- Storage buckets for the CMS Foundation — exactly three, organized by
-- access pattern rather than by entity (see the Phase 3 report's Storage
-- Buckets section for why: media/books/{id}/cover.webp-style key prefixes
-- replace what would otherwise be a bucket-per-content-type).
--
-- `library` already exists in this project today (created before this CMS
-- Foundation work began, and already used by src/admin/services/storage/
-- supabaseAdapter.ts). Inserted here too, idempotently, so this migration
-- is reproducible against a fresh Supabase project as well as this one.
insert into storage.buckets (id, name, public)
values
  ('media', 'media', true),
  ('library', 'library', false),
  ('uploads', 'uploads', false)
on conflict (id) do nothing;

-- ── media bucket: public read, authenticated write, owner-only delete ──
create policy media_bucket_select_public
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

create policy media_bucket_insert_authenticated
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

create policy media_bucket_update_authenticated
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');

create policy media_bucket_delete_owner
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.current_admin_role() = 'owner');

-- ── library bucket: no anonymous access at all ─────────────────────────
-- Matches the trust model the existing storage adapter already documents:
-- authenticated admins manage files directly; real customer access is
-- always through a short-TTL signed URL (getDownloadUrl), never a direct
-- bucket read.
create policy library_bucket_authenticated_only
  on storage.objects for all
  to authenticated
  using (bucket_id = 'library')
  with check (bucket_id = 'library');

-- ── uploads bucket: private staging, authenticated only ─────────────────
create policy uploads_bucket_authenticated_only
  on storage.objects for all
  to authenticated
  using (bucket_id = 'uploads')
  with check (bucket_id = 'uploads');

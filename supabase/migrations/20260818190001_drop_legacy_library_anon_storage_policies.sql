-- Isolated security fix: the "library" storage bucket (holds the actual
-- sold PDF files) has three legacy policies granting the fully
-- unauthenticated `anon` role insert/select/delete on every object in it —
-- confirmed live via pg_policies before writing this migration. These
-- predate and are unrelated to library_bucket_admin_only (added in
-- 20260818120001, already correctly restricted to
-- `current_admin_role() is not null`), which is left untouched below.
--
-- Nothing else in this migration: no other bucket, no other table, no
-- function, no role_permissions/user_permission_overrides change. Scoped
-- to exactly the three named policies confirmed to exist.
drop policy if exists "library: anon insert" on storage.objects;
drop policy if exists "library: anon select" on storage.objects;
drop policy if exists "library: anon delete" on storage.objects;

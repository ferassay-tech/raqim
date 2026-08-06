-- Phase 6B (Library) — new table for the Digital Library's file metadata.
-- The upload/delete byte mechanism is untouched (still routes through
-- services/storage's StorageAdapter registry); only the metadata record
-- that LibraryContext currently keeps in localStorage moves here.
--
-- RLS mirrors Books/Categories/Media exactly, as approved in the Phase
-- 6B plan: anon SELECT, authenticated editor/owner INSERT/UPDATE,
-- owner-only DELETE. Note on that choice: unlike Books/Categories, this
-- table holds paid-content metadata (filename, book_id, storage_key) —
-- DownloadPage.tsx (public, unauthenticated) needs to resolve a
-- customer's purchased file, so anon SELECT can't be closed off without
-- also touching the download-token verification flow, which is
-- explicitly out of scope this phase. Anon SELECT here means the full
-- file list becomes queryable via the public REST API — a wider surface
-- than today's localStorage (inspectable only via one browser's
-- devtools), though not a new category of exposure: the actual bytes
-- still require a signed/time-limited getDownloadUrl() call from the
-- active StorageAdapter, not just the row's storage_key.

create table public.library_files (
  id text primary key,
  filename text not null,
  format text not null check (format in ('pdf', 'epub', 'mobi', 'zip')),
  size integer not null default 0,
  storage_provider text not null,
  storage_key text not null,
  preview_url text,
  book_id text references public.books (id) on delete set null,
  version text,
  uploaded_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index library_files_book_id_idx on public.library_files (book_id);

alter table public.library_files enable row level security;

create policy library_files_select_anon
  on public.library_files for select
  to anon, authenticated
  using (true);

create policy library_files_insert_editor_or_owner
  on public.library_files for insert
  to authenticated
  with check (current_admin_role() in ('editor', 'owner'));

create policy library_files_update_editor_or_owner
  on public.library_files for update
  to authenticated
  using (current_admin_role() in ('editor', 'owner'))
  with check (current_admin_role() in ('editor', 'owner'));

create policy library_files_delete_owner
  on public.library_files for delete
  to authenticated
  using (current_admin_role() = 'owner');

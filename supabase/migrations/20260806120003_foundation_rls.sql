-- Row Level Security for the CMS Foundation Phase 4 tables, following the
-- security model from the Phase 3 report exactly: anonymous reads
-- public/published data only; any authenticated admin can read
-- everything; editors write routine content; owners write site-wide/
-- structural config and are the only role with real DELETE.
--
-- Bootstrapping note: the very first admin_profiles row, and the initial
-- site_settings row, must be inserted with the service-role key (which
-- bypasses RLS by design) — there is no owner yet to satisfy an
-- "owner-only insert" policy on the very first write. See
-- supabase/seed/README.sql. Everything below governs writes *after* that
-- one-time bootstrap.

-- Helper: resolves the calling user's role without recursively hitting
-- admin_profiles' own RLS (SECURITY DEFINER is required here, exactly as
-- Postgres/Supabase's own docs recommend for this pattern — otherwise a
-- policy that calls this function would deadlock against itself).
create or replace function public.current_admin_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.admin_profiles where id = auth.uid();
$$;

-- ── admin_profiles ─────────────────────────────────────────────────────
alter table public.admin_profiles enable row level security;

create policy admin_profiles_select_authenticated
  on public.admin_profiles for select
  to authenticated
  using (true);

create policy admin_profiles_write_owner
  on public.admin_profiles for all
  to authenticated
  using (public.current_admin_role() = 'owner')
  with check (public.current_admin_role() = 'owner');

-- ── categories ─────────────────────────────────────────────────────────
alter table public.categories enable row level security;

create policy categories_select_anon
  on public.categories for select
  to anon, authenticated
  using (true);

create policy categories_insert_editor_or_owner
  on public.categories for insert
  to authenticated
  with check (public.current_admin_role() in ('editor', 'owner'));

create policy categories_update_editor_or_owner
  on public.categories for update
  to authenticated
  using (public.current_admin_role() in ('editor', 'owner'))
  with check (public.current_admin_role() in ('editor', 'owner'));

create policy categories_delete_owner
  on public.categories for delete
  to authenticated
  using (public.current_admin_role() = 'owner');

-- ── media_folders / media_assets ───────────────────────────────────────
alter table public.media_folders enable row level security;
alter table public.media_assets enable row level security;

create policy media_folders_select_anon
  on public.media_folders for select
  to anon, authenticated
  using (true);

create policy media_folders_insert_editor_or_owner
  on public.media_folders for insert
  to authenticated
  with check (public.current_admin_role() in ('editor', 'owner'));

create policy media_folders_update_editor_or_owner
  on public.media_folders for update
  to authenticated
  using (public.current_admin_role() in ('editor', 'owner'))
  with check (public.current_admin_role() in ('editor', 'owner'));

create policy media_folders_delete_owner
  on public.media_folders for delete
  to authenticated
  using (public.current_admin_role() = 'owner');

create policy media_assets_select_anon
  on public.media_assets for select
  to anon, authenticated
  using (true);

create policy media_assets_insert_editor_or_owner
  on public.media_assets for insert
  to authenticated
  with check (public.current_admin_role() in ('editor', 'owner'));

create policy media_assets_update_editor_or_owner
  on public.media_assets for update
  to authenticated
  using (public.current_admin_role() in ('editor', 'owner'))
  with check (public.current_admin_role() in ('editor', 'owner'));

create policy media_assets_delete_owner
  on public.media_assets for delete
  to authenticated
  using (public.current_admin_role() = 'owner');

-- ── redirects ────────────────────────────────────────────────────────
-- Anonymous SELECT is allowed so a future redirect-resolving request path
-- can read it under the anon key — this app has no such consumer yet
-- (redirects are new, unused infrastructure from Phase 3.1).
alter table public.redirects enable row level security;

create policy redirects_select_anon
  on public.redirects for select
  to anon, authenticated
  using (true);

create policy redirects_write_owner
  on public.redirects for all
  to authenticated
  using (public.current_admin_role() = 'owner')
  with check (public.current_admin_role() = 'owner');

-- ── site_settings ────────────────────────────────────────────────────
-- Site configuration is rendered on every public page today (SEO
-- defaults, brand colors, contact info) — not secret, so anonymous SELECT
-- is intentional and matches how Settings already behaves.
alter table public.site_settings enable row level security;

create policy site_settings_select_anon
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy site_settings_write_owner
  on public.site_settings for all
  to authenticated
  using (public.current_admin_role() = 'owner')
  with check (public.current_admin_role() = 'owner');

-- ── content_history ──────────────────────────────────────────────────
-- No direct client INSERT policy at all, on purpose — every write goes
-- through record_content_history() (see the schema migration), a
-- SECURITY DEFINER function, so a client can never supply its own version
-- number or bypass the trigger that assigns one.
alter table public.content_history enable row level security;

create policy content_history_select_authenticated
  on public.content_history for select
  to authenticated
  using (true);

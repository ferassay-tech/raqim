-- Admin Security Hardening — Phase 1: DATABASE FOUNDATION ONLY.
--
-- Scope (per the approved Phase 1 plan): extend admin_profiles, introduce
-- the ownership singleton / permission tables / invitation table / audit
-- log, harden current_admin_role() to respect suspension, and fix the two
-- confirmed pre-existing gaps (admin_profiles readable by any authenticated
-- user; library/uploads/media storage writable by any authenticated user
-- regardless of admin status). Nothing here touches the frontend, routing,
-- Resend, or any existing owner/editor RLS distinction beyond what's
-- explicitly listed below — every existing 'owner'-only /
-- 'editor-or-owner' policy on books/articles/orders/etc. is left untouched
-- and keeps working exactly as before, since 'owner' and 'editor' remain
-- valid roles and current_admin_role()'s signature/return shape is
-- unchanged.
--
-- Additive and reversible throughout: no table is dropped, no row is
-- deleted, no existing constraint is narrowed (only widened), and every
-- new table starts with RLS enabled and deny-by-default (no permissive
-- policy) where a later phase's SECURITY DEFINER function is the intended,
-- not-yet-built write path — matching content_history's own established
-- "no direct client INSERT policy, writes only through a function" pattern
-- in this codebase.

-- ════════════════════════════════════════════════════════════════════════
-- 1. EXTEND admin_profiles — widen role vocabulary, add status/invited_by
-- ════════════════════════════════════════════════════════════════════════

-- The original `role` check was declared inline with no explicit name, so
-- Postgres auto-named it — rather than assume that name, find and drop
-- whatever check constraint actually governs `role` right now. Safer than
-- guessing a name per this migration's own safety rules.
do $$
declare
  v_conname text;
begin
  select conname into v_conname
  from pg_constraint
  where conrelid = 'public.admin_profiles'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%role%';
  if v_conname is not null then
    execute format('alter table public.admin_profiles drop constraint %I', v_conname);
  end if;
end $$;

alter table public.admin_profiles
  add constraint admin_profiles_role_check
  check (role in ('owner', 'super_admin', 'admin', 'editor', 'analyst'));

-- status: an admin_profiles row now represents "was once approved," not
-- necessarily "is currently allowed in" — current_admin_role() (section 5
-- below) is what actually turns 'suspended' into zero effective access
-- everywhere, without touching any of the many existing policies that
-- already call it.
alter table public.admin_profiles
  add column if not exists status text not null default 'active'
    check (status in ('active', 'suspended'));

-- invited_by: nullable — the existing owner/editor rows were bootstrapped
-- manually (see supabase/seed/bootstrap_admin_profiles.sql), not invited
-- by anyone in-app, so this is correctly null for them. Populated by a
-- future invite/accept flow, not this phase.
alter table public.admin_profiles
  add column if not exists invited_by uuid references public.admin_profiles(id);

-- ════════════════════════════════════════════════════════════════════════
-- 2. platform_ownership — singleton, structurally prevents a second owner
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.platform_ownership (
  id boolean primary key default true check (id),
  owner_profile_id uuid not null references public.admin_profiles(id),
  transferred_at timestamptz not null default now(),
  transferred_by uuid references public.admin_profiles(id)
);
-- `id boolean primary key check (id)` — only the value `true` can ever
-- satisfy the check, and a primary key forbids a second row with the same
-- value, so a second INSERT of any kind is a primary-key violation. This
-- is enforced by Postgres itself, not application logic.

alter table public.platform_ownership enable row level security;

-- Read-only for any real, active admin — knowing who the owner is isn't
-- sensitive among admins, and the app will need this for basic display
-- later. No INSERT/UPDATE/DELETE policy of any kind, for any role,
-- including owner — Phase 1 deliberately ships no transfer_ownership()
-- function, so this table must stay unwritable from the client entirely
-- until that function exists in a later phase. The one seed row below is
-- inserted by this migration itself (runs with elevated migration
-- privileges, not subject to RLS).
create policy platform_ownership_select_active_admin
  on public.platform_ownership for select
  to authenticated
  using (public.current_admin_role() is not null);

-- Seed exactly one row, pointing at the real owner's existing
-- admin_profiles record (matched via the linked auth.users email — never
-- assumed by id). If no such row exists yet, this does NOT fail the
-- migration — it raises a loud warning instead, since failing here would
-- block every other, independent fix in this file. Verify manually (see
-- the report) if this warning appears.
do $$
declare
  v_owner_id uuid;
begin
  select ap.id into v_owner_id
  from public.admin_profiles ap
  join auth.users au on au.id = ap.id
  where au.email = 'raqim.house@gmail.com'
    and ap.role = 'owner'
  limit 1;

  if v_owner_id is null then
    raise warning 'platform_ownership seed SKIPPED: no admin_profiles row with role = ''owner'' found for auth.users.email = ''raqim.house@gmail.com''. Insert the seed row manually once that row exists — see the migration report.';
  else
    insert into public.platform_ownership (owner_profile_id)
    values (v_owner_id)
    on conflict (id) do nothing;
  end if;
end $$;

-- ════════════════════════════════════════════════════════════════════════
-- 3. role_permissions / user_permission_overrides — normalized permissions
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.role_permissions (
  role text not null,
  permission text not null,
  primary key (role, permission)
);

alter table public.role_permissions enable row level security;

-- Reference/config data — any real active admin may read the matrix
-- (harmless, low-sensitivity). No write policy: seeded by this migration
-- only; nothing in this phase writes to it at runtime.
create policy role_permissions_select_active_admin
  on public.role_permissions for select
  to authenticated
  using (public.current_admin_role() is not null);

create table if not exists public.user_permission_overrides (
  user_id uuid not null references public.admin_profiles(id) on delete cascade,
  permission text not null,
  granted boolean not null,
  primary key (user_id, permission)
);

alter table public.user_permission_overrides enable row level security;

-- More sensitive than the role matrix (per-person grants) — visible to the
-- person it's about, plus owner/super_admin. No write policy in this
-- phase: table stays empty until a future change_permissions() function
-- exists.
create policy user_permission_overrides_select_self_or_privileged
  on public.user_permission_overrides for select
  to authenticated
  using (user_id = auth.uid() or public.current_admin_role() in ('owner', 'super_admin'));

-- Seed matrix — matches the approved permission list. Additive reference
-- data only; nothing in the running app reads this yet (frontend changes
-- are explicitly out of scope for this phase).
insert into public.role_permissions (role, permission) values
  ('super_admin', 'dashboard.view'), ('super_admin', 'analytics.view'),
  ('super_admin', 'books.view'), ('super_admin', 'books.create'), ('super_admin', 'books.edit'), ('super_admin', 'books.delete'),
  ('super_admin', 'categories.manage'),
  ('super_admin', 'orders.view'), ('super_admin', 'orders.manage'),
  ('super_admin', 'customers.view'), ('super_admin', 'customers.manage'),
  ('super_admin', 'coupons.manage'),
  ('super_admin', 'articles.view'), ('super_admin', 'articles.create'), ('super_admin', 'articles.edit'), ('super_admin', 'articles.delete'),
  ('super_admin', 'media.manage'), ('super_admin', 'library.manage'),
  ('super_admin', 'messages.view'), ('super_admin', 'messages.reply'),
  ('super_admin', 'communications.manage'), ('super_admin', 'content.manage'),
  ('super_admin', 'settings.manage'),
  ('super_admin', 'users.view'), ('super_admin', 'users.invite'), ('super_admin', 'users.approve'),
  ('super_admin', 'users.suspend'), ('super_admin', 'users.change_role'), ('super_admin', 'users.change_permissions'),
  ('super_admin', 'audit_log.view'),

  ('admin', 'dashboard.view'), ('admin', 'analytics.view'),
  ('admin', 'books.view'), ('admin', 'books.create'), ('admin', 'books.edit'), ('admin', 'books.delete'),
  ('admin', 'categories.manage'),
  ('admin', 'orders.view'), ('admin', 'orders.manage'),
  ('admin', 'customers.view'), ('admin', 'customers.manage'),
  ('admin', 'coupons.manage'),
  ('admin', 'articles.view'), ('admin', 'articles.create'), ('admin', 'articles.edit'), ('admin', 'articles.delete'),
  ('admin', 'media.manage'), ('admin', 'library.manage'),
  ('admin', 'messages.view'), ('admin', 'messages.reply'),
  ('admin', 'communications.manage'), ('admin', 'content.manage'),
  ('admin', 'users.view'),

  ('editor', 'dashboard.view'),
  ('editor', 'books.view'), ('editor', 'books.create'), ('editor', 'books.edit'),
  ('editor', 'categories.manage'),
  ('editor', 'articles.view'), ('editor', 'articles.create'), ('editor', 'articles.edit'),
  ('editor', 'media.manage'), ('editor', 'content.manage'),

  ('analyst', 'dashboard.view'), ('analyst', 'analytics.view'),
  ('analyst', 'orders.view'), ('analyst', 'customers.view')
on conflict (role, permission) do nothing;

-- ════════════════════════════════════════════════════════════════════════
-- 4. admin_invitations
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null check (role in ('super_admin', 'admin', 'editor', 'analyst')),
  permission_overrides jsonb not null default '[]',
  token_hash text not null unique,
  invited_by uuid not null references public.admin_profiles(id),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.admin_invitations enable row level security;

-- Deliberately deny-by-default this phase: no SELECT/INSERT/UPDATE policy
-- at all. Only owner/super_admin should ever see pending invitations, and
-- the actual invite/accept SECURITY DEFINER functions (which will bypass
-- RLS by running as their own privileged context, same as
-- record_content_history()) don't exist yet — so there is nothing that
-- should be able to read or write this table from the client this phase.
-- A read policy is trivial to add in the phase that ships the Users UI.

-- ════════════════════════════════════════════════════════════════════════
-- 5. admin_audit_log — insert-only, immutable
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.admin_profiles(id),
  action text not null,
  target_user_id uuid references public.admin_profiles(id),
  result text not null check (result in ('success', 'denied', 'error')),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.admin_audit_log enable row level security;

create policy admin_audit_log_select_owner_or_super_admin
  on public.admin_audit_log for select
  to authenticated
  using (public.current_admin_role() in ('owner', 'super_admin'));

-- No UPDATE policy. No DELETE policy. No direct client INSERT policy
-- either — every write will go through a future SECURITY DEFINER logging
-- function (not built this phase, since the actions that would trigger it
-- — invite/approve/suspend/role-change/transfer — don't exist yet either).
-- The table is therefore fully immutable from the client today: it can
-- only ever be empty until that function ships.

-- ════════════════════════════════════════════════════════════════════════
-- 6. current_admin_role() — respect suspension, signature unchanged
-- ════════════════════════════════════════════════════════════════════════

-- Same name, same zero args, same `returns text`, same STABLE/SECURITY
-- DEFINER/search_path shape every existing caller (every RLS policy that
-- already calls this) already relies on — only the WHERE clause changes.
-- A suspended admin's row still exists (nothing is deleted), it just no
-- longer matches, so this returns NULL for them exactly as it already does
-- for "no row at all" — every existing `current_admin_role() = 'owner'` /
-- `in ('editor','owner')` policy across every other table automatically
-- treats a suspended admin as unauthorized, with zero changes to any of
-- those other policies.
create or replace function public.current_admin_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.admin_profiles
  where id = auth.uid() and status = 'active';
$$;

-- ════════════════════════════════════════════════════════════════════════
-- 7. admin_profiles — fix unrestricted SELECT (confirmed gap)
-- ════════════════════════════════════════════════════════════════════════

drop policy if exists admin_profiles_select_authenticated on public.admin_profiles;

-- Any authenticated user may read their OWN row (needed for the app to
-- ever show "who am I, what's my status" — including a rejected/no-profile
-- user's own missing-row case, which simply matches nothing here, and
-- correctly matches nothing in the policy below either, so they see
-- nothing at all, not an error).
create policy admin_profiles_select_self
  on public.admin_profiles for select
  to authenticated
  using (id = auth.uid());

-- Owner/super_admin may read every profile (needed for future user
-- management). Nobody else can enumerate other admins' identities.
create policy admin_profiles_select_owner_or_super_admin
  on public.admin_profiles for select
  to authenticated
  using (public.current_admin_role() in ('owner', 'super_admin'));

-- admin_profiles_write_owner (existing, owner-only) is left EXACTLY as-is
-- deliberately — not widened to super_admin in this phase. No super_admin
-- account exists yet, and the functions that would safely mediate
-- super_admin writing to this table (change_role, suspend_user, etc.)
-- aren't built yet either; widening the raw table-write policy ahead of
-- those functions would let a future super_admin UPDATE admin_profiles
-- directly and unsafely (e.g. promote themselves to 'owner') instead of
-- through a guarded function. Revisit when those functions ship.

-- ════════════════════════════════════════════════════════════════════════
-- 8. Storage — fix unrestricted authenticated access (confirmed gap)
-- ════════════════════════════════════════════════════════════════════════
-- library holds the actual sold PDF files; uploads is a private staging
-- bucket. Neither should be reachable by an authenticated user who isn't a
-- real, active admin. media's public SELECT is intentional (public site
-- assets) and is untouched; only its authenticated write policies gain the
-- same admin check.

drop policy if exists media_bucket_insert_authenticated on storage.objects;
create policy media_bucket_insert_admin_only
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.current_admin_role() is not null);

drop policy if exists media_bucket_update_authenticated on storage.objects;
create policy media_bucket_update_admin_only
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.current_admin_role() is not null)
  with check (bucket_id = 'media' and public.current_admin_role() is not null);
-- media_bucket_select_public (public site assets) and media_bucket_delete_owner
-- (already owner-gated) are untouched.

drop policy if exists library_bucket_authenticated_only on storage.objects;
create policy library_bucket_admin_only
  on storage.objects for all
  to authenticated
  using (bucket_id = 'library' and public.current_admin_role() is not null)
  with check (bucket_id = 'library' and public.current_admin_role() is not null);

drop policy if exists uploads_bucket_authenticated_only on storage.objects;
create policy uploads_bucket_admin_only
  on storage.objects for all
  to authenticated
  using (bucket_id = 'uploads' and public.current_admin_role() is not null)
  with check (bucket_id = 'uploads' and public.current_admin_role() is not null);

-- Customer-facing downloads are unaffected: getDownloadUrl's short-TTL
-- signed URLs (see download_tokens / resolve_download_token()) are
-- generated with the service-role key server-side context and validated
-- entirely on their own token/expiry logic, never through these
-- `authenticated`-role storage.objects policies — a real customer is never
-- an `authenticated` Supabase Auth user in this app at all.

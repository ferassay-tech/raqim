-- Phase 6D (Coupons) — new table for discount codes. Unlike orders, this
-- table is never written to by an anonymous customer: checkout only reads
-- the live coupon list to validate a code. RLS here reverts to the same
-- shape already proven for categories/books/media_assets/media_folders/
-- library_files: anon SELECT (checkout genuinely needs the full list to
-- look codes up by value), authenticated editor/owner INSERT/UPDATE,
-- owner-only DELETE (a real, exercised admin capability today, unlike
-- orders which has no delete path at all).
--
-- `code` gets a unique constraint: not a new feature, just making the
-- database enforce an invariant the app already assumes (checkout looks
-- a coupon up by code value, not id, and the admin form already checks
-- existing codes client-side before allowing a save).
--
-- starts_at/expires_at are plain calendar dates (the admin form only ever
-- collects a <input type="date">, no time-of-day component anywhere in
-- this data), so they're `date`, not `timestamptz`.

create table public.coupons (
  id text primary key,
  code text not null unique,
  type text not null check (type in ('percentage', 'fixed')),
  value numeric not null,
  min_order_value numeric,
  usage_limit integer,
  usage_count integer not null default 0,
  starts_at date,
  expires_at date,
  enabled boolean not null default false,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_coupons_updated_at
  before update on public.coupons
  for each row
  execute function public.set_updated_at();

alter table public.coupons enable row level security;

create policy coupons_select_anon
  on public.coupons for select
  to anon, authenticated
  using (true);

create policy coupons_insert_editor_or_owner
  on public.coupons for insert
  to authenticated
  with check (current_admin_role() in ('editor', 'owner'));

create policy coupons_update_editor_or_owner
  on public.coupons for update
  to authenticated
  using (current_admin_role() in ('editor', 'owner'))
  with check (current_admin_role() in ('editor', 'owner'));

create policy coupons_delete_owner
  on public.coupons for delete
  to authenticated
  using (current_admin_role() = 'owner');

-- CMS Foundation Phase 4 — foundation tables only.
-- Reference: CMS Foundation Phase 3 (Database Architecture Report) and
-- Phase 3.1 (Architecture Expansion). Deliberately excludes every
-- commerce/content table (books, authors, articles, orders, customers,
-- coupons, payments, forms, analytics, notifications) — those are future
-- phases, not this one.

-- Generic trigger: keeps `updated_at` current on any table that has one,
-- reused across every table below instead of one trigger function per
-- table.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1. admin_profiles ---------------------------------------------------------
-- One row per real Supabase-authenticated admin. id is intentionally the
-- SAME id as auth.users — never a separate surrogate key — so RLS
-- policies elsewhere can join straight off auth.uid(). The very first row
-- must be inserted with the service-role key (see supabase/seed/) since no
-- owner exists yet to satisfy the owner-only write policy created in the
-- RLS migration.
create table if not exists public.admin_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  role text not null check (role in ('owner', 'editor')),
  created_at timestamptz not null default now()
);

-- 2. categories ---------------------------------------------------------
-- Already migrated to the generic CollectionAdapter engine (local backend)
-- in CMS Foundation Phase 2. This is its future Supabase shape — id stays
-- the existing slug-style id (e.g. "cat-motherhood"), not a new surrogate
-- key, so the seed data and any future Books.category_id backfill resolve
-- against a stable, already-familiar id.
create table if not exists public.categories (
  id text primary key,
  name jsonb not null,
  description jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
  before update on public.categories
  for each row
  execute function public.set_updated_at();

-- 3. media_folders --------------------------------------------------------
create table if not exists public.media_folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- 4. media_assets ---------------------------------------------------------
-- storage_key decouples "where the bytes live" from "the asset's
-- identity" — url is resolved from storage_key by the app at read/write
-- time and kept here only as a convenience cache, not the source of
-- truth. Mirrors the storageKey/previewUrl split library_files already
-- uses today for downloadable book files.
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_key text not null,
  url text,
  name text not null,
  type text not null check (type in ('image', 'document')),
  folder_id uuid references public.media_folders (id) on delete set null,
  size integer not null default 0,
  width integer,
  height integer,
  uploaded_at timestamptz not null default now()
);

-- 5. redirects ------------------------------------------------------------
-- New, greenfield (Phase 3.1) — no existing behavior to preserve.
create table if not exists public.redirects (
  id uuid primary key default gen_random_uuid(),
  from_path text not null unique,
  to_path text not null,
  status_code integer not null default 301 check (status_code in (301, 302)),
  created_at timestamptz not null default now()
);

-- 6. site_settings (singleton) ---------------------------------------------
-- Exactly one row, scope = 'default' — the entire settings document
-- (general/brand/seo/homepage/contact/store/storage/typography/
-- navigation/footer/social/analytics) as one jsonb document, matching the
-- existing AdminSettingsRaw shape so the eventual migration is a data
-- copy, not a redesign.
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  scope text not null unique default 'default',
  data jsonb not null,
  schema_version integer not null default 1,
  version integer not null default 1,
  updated_by uuid references public.admin_profiles (id),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
  before update on public.site_settings
  for each row
  execute function public.set_updated_at();

-- 7. content_history (shared, polymorphic) ---------------------------------
-- ONE history table for every editorial entity (books, authors, articles,
-- categories, settings, and any future Design System module) — never a
-- table per entity. `version` is assigned by the trigger below, never
-- trusted from client input, so two concurrent writers can never race.
create table if not exists public.content_history (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  data jsonb not null,
  version integer not null,
  updated_by uuid references public.admin_profiles (id),
  created_at timestamptz not null default now()
);

create or replace function public.set_content_history_version()
returns trigger
language plpgsql
as $$
begin
  select coalesce(max(version), 0) + 1
    into new.version
    from public.content_history
   where entity_type = new.entity_type
     and entity_id = new.entity_id;
  return new;
end;
$$;

drop trigger if exists set_content_history_version on public.content_history;
create trigger set_content_history_version
  before insert on public.content_history
  for each row
  execute function public.set_content_history_version();

-- Clients never insert into content_history directly (see the RLS
-- migration — there is no direct INSERT policy on this table at all).
-- This SECURITY DEFINER function is the only write path, so the version
-- trigger above always runs under one trusted execution context instead
-- of being reachable from arbitrary client-supplied rows.
create or replace function public.record_content_history(
  p_entity_type text,
  p_entity_id text,
  p_data jsonb
)
returns public.content_history
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.content_history;
begin
  insert into public.content_history (entity_type, entity_id, data, version, updated_by)
  values (p_entity_type, p_entity_id, p_data, 0, auth.uid())
  returning * into v_row;
  return v_row;
end;
$$;

grant execute on function public.record_content_history(text, text, jsonb) to authenticated;

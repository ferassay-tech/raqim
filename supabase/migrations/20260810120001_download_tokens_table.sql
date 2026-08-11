-- P0-1 — moves download-token storage/resolution from browser localStorage
-- (DownloadsContext's old usePersistedState) to Supabase, so a paid
-- customer's emailed /download/{token} link works from any device, not
-- just the admin's own browser that generated it.
--
-- Security model, deliberately mirroring two patterns already established
-- in this codebase rather than inventing a new one:
--
-- 1. orders_insert_checkout's WITH CHECK trick (20260806160001): an anon/
--    authenticated INSERT is only ever allowed to land in a safe, verified
--    state. Here, an admin can only mint a token for an order that is
--    ALREADY 'paid' in the orders table itself — re-verified by the
--    database, not trusted from the client — so "unpaid orders never
--    receive a usable token" is enforced at the RLS layer, not just by the
--    Admin UI's own `order.status === "paid"` check (OrderDownloadsCard.tsx).
--
-- 2. record_content_history's SECURITY DEFINER function (20260806120001):
--    the ONLY privileged path into a table RLS otherwise locks down
--    completely for the caller's own role. Here, an anonymous customer
--    resolving/using their own token can never SELECT the download_tokens
--    table directly (no anon policy exists at all) — they can only call
--    resolve_download_token()/record_download_token_use(), which take the
--    raw token as a parameter, hash it, and look up exactly one matching
--    row. This is the standard "compare a hash, never expose the table"
--    pattern — no service-role key is needed anywhere for this feature.
--
-- Only a SHA-256 hash of the token is ever stored (token_hash) — never the
-- raw bearer value itself, so a leaked row (backup, admin SELECT, etc.)
-- can't be replayed as a working download link, the same reasoning as
-- storing a password hash instead of a password.

create extension if not exists pgcrypto;

create table public.download_tokens (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders (id) on delete cascade,
  token_hash text not null unique,
  file_ids jsonb not null,
  expires_at timestamptz,
  max_downloads integer,
  download_count integer not null default 0,
  disabled boolean not null default false,
  last_downloaded_at timestamptz,
  created_at timestamptz not null default now()
);

create index download_tokens_order_id_idx on public.download_tokens (order_id);

alter table public.download_tokens enable row level security;

-- Admin visibility only (the existing Order detail page's downloads card) —
-- customers never read this table directly, see the functions below.
create policy download_tokens_select_authenticated
  on public.download_tokens for select
  to authenticated
  using (current_admin_role() in ('editor', 'owner'));

-- The order this token is for must already be 'paid' at the moment of
-- insert — re-checked here, not trusted from the client, so a bug or a
-- forged request in the Admin UI can never mint a working token for an
-- unpaid order.
create policy download_tokens_insert_editor_or_owner
  on public.download_tokens for insert
  to authenticated
  with check (
    current_admin_role() in ('editor', 'owner')
    and exists (
      select 1 from public.orders o
      where o.id = order_id and o.status = 'paid'
    )
  );

-- Covers the existing "تعطيل الرابط" (disable) admin action. download_count/
-- last_downloaded_at are updated only via record_download_token_use below,
-- never through this policy — an authenticated admin has no reason to
-- write those columns directly.
create policy download_tokens_update_editor_or_owner
  on public.download_tokens for update
  to authenticated
  using (current_admin_role() in ('editor', 'owner'))
  with check (current_admin_role() in ('editor', 'owner'));

-- No DELETE policy: same as orders, nothing in the app deletes a token
-- today — RLS default-denies with no matching policy.

-- Resolves a customer's raw token (from the /download/:token URL) to the
-- order/files it grants access to, WITHOUT ever exposing the
-- download_tokens table itself to anon. Returns nothing if the token
-- doesn't exist, is disabled, has expired, or has hit its download limit —
-- DownloadPage.tsx treats an empty result exactly like "invalid link"
-- (unified handling, no new error tier).
create or replace function public.resolve_download_token(p_token text)
returns table (order_id text, file_ids jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text := encode(digest(p_token, 'sha256'), 'hex');
begin
  return query
    select dt.order_id, dt.file_ids
    from public.download_tokens dt
    where dt.token_hash = v_hash
      and dt.disabled = false
      and (dt.expires_at is null or dt.expires_at > now())
      and (dt.max_downloads is null or dt.download_count < dt.max_downloads);
end;
$$;

grant execute on function public.resolve_download_token(text) to anon, authenticated;

-- Records one successful file download — kept separate from
-- resolve_download_token (the same split the old client-only
-- resolveToken()/recordDownload() already had) so a page view alone never
-- counts against max_downloads, only an actual completed fetch does
-- (DownloadPage.tsx calls this from inside handleDownload's success path).
-- Re-validates the token's own state again rather than trusting that the
-- caller already called resolve_download_token — an already-expired/
-- disabled/exhausted token silently updates nothing.
create or replace function public.record_download_token_use(p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text := encode(digest(p_token, 'sha256'), 'hex');
begin
  update public.download_tokens
     set download_count = download_count + 1,
         last_downloaded_at = now()
   where token_hash = v_hash
     and disabled = false
     and (expires_at is null or expires_at > now())
     and (max_downloads is null or download_count < max_downloads);
end;
$$;

grant execute on function public.record_download_token_use(text) to anon, authenticated;

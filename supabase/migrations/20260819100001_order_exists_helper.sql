-- Fixes the order-attachment upload bug diagnosed against the live
-- database: order_attachments_insert_anon and
-- order_attachments_bucket_insert_anon both used
-- `EXISTS (SELECT 1 FROM public.orders WHERE id = ...)` inside their
-- WITH CHECK. That subquery is itself subject to orders' own RLS for the
-- executing role — and orders_select_authenticated (from the earlier
-- hardening phase) correctly grants anon no SELECT visibility at all.
-- Confirmed live and read-only, no data touched:
--   set role anon;
--   select exists (select 1 from public.orders where id = '<a real,
--     currently-existing order id>');  -- returned false
-- So the EXISTS check was unconditionally false for anon on every order,
-- valid or not — every anonymous attachment upload was rejected by
-- Storage RLS with "new row violates row-level security policy"
-- (AccessDenied), 100% of the time. orders_insert_checkout never hit this
-- because its own WITH CHECK is self-contained (status/discount on the row
-- being inserted) and never needs to read back any row.
--
-- Fix: a narrow SECURITY DEFINER boolean helper. Placed in a dedicated
-- `private` schema (not `public`) specifically so it is never reachable as
-- a REST/RPC endpoint — Supabase's Data API only exposes schemas listed
-- in its "Exposed schemas" project setting (public by default); creating
-- a schema via migration never adds it to that list, and nothing in this
-- migration touches that setting. RLS policy evaluation happens inside
-- Postgres itself, not through PostgREST, so the policies below can still
-- call it directly even though the API can't reach it as an RPC endpoint.
-- orders' own RLS is completely untouched by this migration: no anon
-- SELECT policy is added to it anywhere.

create schema if not exists private;

create function private.order_exists(p_order_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (select 1 from public.orders where id = p_order_id);
$function$;

-- No dynamic SQL, no string concatenation — p_order_id is a bound
-- parameter, not interpolated into query text, so this cannot be abused
-- for SQL injection or to read anything beyond a single boolean. Empty
-- search_path plus the fully-qualified public.orders reference means name
-- resolution inside the function body cannot be hijacked by any
-- search_path manipulation.

revoke all on function private.order_exists(text) from public;
-- Schema-level USAGE is required for anon to reference an object inside
-- `private` at all (even indirectly, via the policy expression below) —
-- separate from, and in addition to, EXECUTE on the function itself.
-- Neither grant makes the function reachable as an API endpoint: that is
-- controlled solely by the Data API's exposed-schemas setting, which this
-- migration does not and cannot change, and which does not include
-- `private` by default.
grant usage on schema private to anon;
-- Only anon actually calls this: both policies that reference it are
-- `to anon` only (order_attachments_insert_anon,
-- order_attachments_bucket_insert_anon). No authenticated-role policy
-- calls it — has_permission('orders.view') already fully covers admin
-- reads — so authenticated is deliberately not granted here.
grant execute on function private.order_exists(text) to anon;

-- ── replace only the broken condition in each policy ────────────────────
-- Every other condition (anon-only INSERT, bucket_id scoping, no anon
-- SELECT/UPDATE/DELETE, admin SELECT gated on orders.view) is unchanged —
-- alter policy only rewrites the clause given, name/roles/command stay
-- exactly as before.

alter policy order_attachments_insert_anon on public.order_attachments
  with check (private.order_exists(order_attachments.order_id));

alter policy order_attachments_bucket_insert_anon on storage.objects
  with check (
    bucket_id = 'order-attachments'
    and private.order_exists((storage.foldername(name))[1])
  );

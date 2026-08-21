-- Critical business-integrity fix: idempotent order creation.
--
-- Root cause (read-only investigation, approved separately): the payment
-- confirmation submit button had no in-flight guard, and orders.id is
-- generated client-side from Date.now() fresh on every call — so N rapid
-- clicks/resubmits of the SAME checkout attempt created N fully
-- independent, individually valid order rows. Nothing in the schema ever
-- treated "one checkout attempt" as a single unit.
-- order_notification_claims (20260819130001_admin_payment_notifications.sql)
-- already protects against duplicate ADMIN EMAILS per order correctly —
-- confirmed by re-reading it — so this migration deliberately does not
-- touch it; the gap was purely upstream, at order creation itself.
--
-- Fix: a client-generated checkout_attempt_id (crypto.randomUUID(), owned
-- by CheckoutContext.tsx, persisted in sessionStorage so a refresh mid-
-- attempt reuses it) is now carried through to this new column. A partial
-- unique index enforces true uniqueness among non-null values only —
-- every existing order gets NULL here (nullable, no default, no backfill;
-- there is no way to reconstruct a historical attempt id) and is
-- completely unaffected; no existing row is modified. New orders always
-- set a real value.
--
-- The unique index is the actual concurrency guard, not the frontend
-- guard: Postgres serializes concurrent INSERTs racing on the same
-- checkout_attempt_id, so exactly one can ever succeed; every other one
-- gets a deterministic 23505 unique-violation (not a race window), which
-- OrdersContext.createOrder() catches and resolves to the winning order
-- via the RPC below, instead of creating a second row or surfacing an
-- error to the customer.
--
-- get_order_id_by_checkout_attempt(): the narrowest possible read this
-- resolution needs. public.orders has no anon SELECT policy (deliberately
-- — see 20260806160001_orders_table.sql: customer PII must not be
-- publicly readable) and this migration does not add one or weaken RLS
-- in any way. Instead: one SECURITY DEFINER function, taking only the
-- opaque client-generated UUID as input (128 bits of entropy, not
-- guessable/enumerable) and returning only the matching order's own `id`
-- column — nothing about the customer, payment, or any other order.

alter table public.orders
  add column checkout_attempt_id text null;

create unique index orders_checkout_attempt_id_unique_idx
  on public.orders (checkout_attempt_id)
  where checkout_attempt_id is not null;

create or replace function public.get_order_id_by_checkout_attempt(p_attempt_id text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select id
  from public.orders
  where checkout_attempt_id = p_attempt_id
  limit 1
$$;

revoke all on function public.get_order_id_by_checkout_attempt(text) from public;
grant execute on function public.get_order_id_by_checkout_attempt(text) to anon, authenticated;

-- Phase 6C (Orders) — new table for real customer orders. Unlike every
-- prior migration (categories/books/media_assets/media_folders/
-- library_files), this table is written to directly by an unauthenticated
-- customer at checkout, and holds customer PII (name, email, free-text
-- notes, transaction id) that must not be publicly readable. RLS here is
-- deliberately the mirror image of every previous table:
--   - SELECT is authenticated-only (editor/owner) — no anon read, since
--     no public page ever reads an order back through OrdersContext.
--   - INSERT is anon-permitted (checkout has no login) but pinned to a
--     harmless initial state via WITH CHECK: status must be 'pending' and
--     discount must be non-negative. This closes the one real fraud
--     vector a client-writable orders table would otherwise have — a
--     forged direct REST insert with status: 'paid' would trigger
--     OrderDownloadsCard's existing auto-mint-a-download-token effect,
--     handing out a paid file for free. A forged row can now only ever
--     land as an ordinary pending order requiring the same manual admin
--     review every real order already goes through.
--   - UPDATE (status changes, timeline notes) stays authenticated
--     editor/owner only, same bar as every other table.
--   - No DELETE policy at all: the app has no delete-order capability
--     today, so RLS default-denies deletes with no matching policy —
--     strictly more restrictive than before, fully additive.
--
-- created_at/updated_at are database-assigned only (default now() / the
-- shared set_updated_at() trigger from the Phase 4 foundation migration)
-- and never accepted from client input, since an anon client could
-- otherwise forge an order's timestamp.

create table public.orders (
  id text primary key,
  customer_id text not null,
  customer_name text not null,
  customer_email text not null,
  status text not null default 'pending' check (status in ('paid', 'pending', 'refunded', 'cancelled')),
  payment_method text not null,
  transaction_id text,
  customer_notes text,
  items jsonb not null,
  discount numeric not null default 0 check (discount >= 0),
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_customer_id_idx on public.orders (customer_id);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at);

create trigger set_orders_updated_at
  before update on public.orders
  for each row
  execute function public.set_updated_at();

alter table public.orders enable row level security;

create policy orders_select_authenticated
  on public.orders for select
  to authenticated
  using (current_admin_role() in ('editor', 'owner'));

create policy orders_insert_checkout
  on public.orders for insert
  to anon, authenticated
  with check (status = 'pending' and discount >= 0);

create policy orders_update_editor_or_owner
  on public.orders for update
  to authenticated
  using (current_admin_role() in ('editor', 'owner'))
  with check (current_admin_role() in ('editor', 'owner'));

-- Order customer attachments. Checkout's file field was confirmed
-- (read-only audit, prior report) to be decorative: PaymentConfirmationForm
-- only ever read file.name, never the bytes; no bucket/table has ever
-- stored anything. This migration adds the real storage + metadata layer
-- and the RLS a genuinely anonymous checkout upload requires.
--
-- order_id is text, matching orders.id's actual live type (client-generated
-- "ORD-..." strings, not uuid) — confirmed against information_schema
-- before writing this, not assumed from a suggested uuid type.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'order-attachments',
  'order-attachments',
  false,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

create table public.order_attachments (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  storage_path text not null,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  uploaded_at timestamptz not null default now()
);

create index order_attachments_order_id_idx on public.order_attachments(order_id);

alter table public.order_attachments enable row level security;

-- Anonymous checkout may record exactly one row per upload, and only for
-- an order that genuinely exists — same "referenced order must be real"
-- shape already used by download_tokens_insert_editor_or_owner.
create policy order_attachments_insert_anon
  on public.order_attachments for insert
  to anon
  with check (
    exists (select 1 from public.orders o where o.id = order_attachments.order_id)
  );

-- Admin reads reuse the existing orders.view permission — no new key.
create policy order_attachments_select_admin
  on public.order_attachments for select
  to authenticated
  using (has_permission('orders.view'));

-- No UPDATE/DELETE policy for anyone, admin included: RLS is enabled with
-- none defined for those commands, so both are unconditionally denied.
-- There is no genuine existing requirement to edit/remove an attachment
-- today, so none is invented.

-- ── order-attachments bucket: anon insert-only, admin read-only ────────
-- Path convention written by the client: order-attachments/{order_id}/
-- {uuid-filename.ext} — the first path segment must match a real order id,
-- checked via storage.foldername(name), the same helper Supabase's own RLS
-- examples use for path-prefix scoping.
create policy order_attachments_bucket_insert_anon
  on storage.objects for insert
  to anon
  with check (
    bucket_id = 'order-attachments'
    and exists (
      select 1 from public.orders o
      where o.id = (storage.foldername(name))[1]
    )
  );

create policy order_attachments_bucket_select_admin
  on storage.objects for select
  to authenticated
  using (bucket_id = 'order-attachments' and has_permission('orders.view'));

-- Phase 6G (Messages) — new table for the admin's customer-conversation
-- inbox. Narrower RLS than any table so far: conversations hold customer
-- PII (name, email, message bodies) with zero public display consumer,
-- so SELECT is authenticated-only (mirrors Orders' reasoning). Neither
-- INSERT nor DELETE has a policy at all: the app has no create-
-- conversation or delete-conversation capability today, so granting
-- either at the database level would add a capability nothing uses.
--
-- This is not a structural dead end. The table and the repository that
-- talks to it (messagesRepository.ts) are designed so a future real
-- intake mechanism (contact form, storefront, webhook, email) becomes a
-- purely additive change: one new, explicitly-scoped
-- `create policy ... for insert ...` migration, whenever that mechanism
-- is actually designed and reviewed — never a change to this table or
-- to messagesRepository.ts itself, which already exposes a working
-- .create() via the generic adapter engine.

create table public.conversations (
  id text primary key,
  customer_id text,
  customer_name text not null,
  customer_email text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  unread boolean not null default true,
  -- Plain text, not timestamptz: the app already stores a pre-formatted
  -- relative display string here (e.g. "اليوم، ٣:٤٥ م" — "today, 3:45
  -- PM"), set explicitly on every write. Preserved exactly as-is.
  updated_at text not null,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index conversations_customer_id_idx on public.conversations (customer_id);

alter table public.conversations enable row level security;

create policy conversations_select_authenticated
  on public.conversations for select
  to authenticated
  using (current_admin_role() in ('editor', 'owner'));

create policy conversations_update_editor_or_owner
  on public.conversations for update
  to authenticated
  using (current_admin_role() in ('editor', 'owner'))
  with check (current_admin_role() in ('editor', 'owner'));

-- No INSERT policy, no DELETE policy — see the header comment above.

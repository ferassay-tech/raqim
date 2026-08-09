-- Footer newsletter signup — first table that exists purely to give the
-- public footer form a real persistence path instead of a fake local
-- success state. No admin list/management UI is being built yet; this is
-- scoped narrowly to "capture the email safely," matching how
-- conversations_table.sql was originally landed with only the capability
-- something actually used at the time.
--
-- email is the primary key: a re-submission of the same address is a
-- harmless no-op at the database level (surfaced to the repository as a
-- distinct 23505 conflict, not a generic failure), on top of the app's
-- own duplicate-submission guard during a pending request.

create table public.newsletter_subscribers (
  email text primary key check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Anonymous visitors can only ever insert themselves — no SELECT policy
-- for anon (subscriber emails have no public display consumer), same
-- reasoning as conversations' authenticated-only read. No UPDATE/DELETE
-- policy exists yet since no capability uses one.
create policy newsletter_subscribers_insert_public
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

create policy newsletter_subscribers_select_authenticated
  on public.newsletter_subscribers for select
  to authenticated
  using (current_admin_role() in ('editor', 'owner'));

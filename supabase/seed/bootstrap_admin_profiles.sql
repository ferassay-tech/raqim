-- One-time bootstrap — NOT part of the migration chain, NOT auto-applied
-- by `supabase db push`/`db reset`, and NOT executed by this phase's work.
--
-- admin_profiles.write_owner (see 20260806120003_foundation_rls.sql)
-- requires an existing owner row to authorize any INSERT — including the
-- very first one. Break that chicken-and-egg problem by running this
-- statement once, manually, using the Supabase SQL Editor (or `psql`)
-- while connected as the project owner / with the service-role key, which
-- bypasses RLS entirely. Every write after this one goes through the
-- normal RLS policies.
--
-- Steps:
--   1. In the Supabase Dashboard → Authentication → Users, create (or
--      identify) the real admin's user record and copy its UUID.
--   2. Replace <SUPABASE_AUTH_USER_UUID> and <ADMIN_NAME> below.
--   3. Run this statement once, in the SQL Editor (which runs as a
--      privileged role, not the anon/authenticated API roles).

insert into public.admin_profiles (id, name, role)
values ('<SUPABASE_AUTH_USER_UUID>', '<ADMIN_NAME>', 'owner')
on conflict (id) do nothing;

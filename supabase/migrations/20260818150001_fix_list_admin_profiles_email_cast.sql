-- Corrective fix for 20260818140001_list_admin_profiles.sql — confirmed
-- live via a real authenticated browser call (owner session): PostgreSQL
-- raised "structure of query does not match function result type".
--
-- Root cause, verified directly against information_schema.columns (not
-- guessed): every returned column matches its RETURNS TABLE declaration
-- exactly except one — auth.users.email is `character varying`
-- (Supabase's built-in auth schema), while the function declares
-- `email text`. RETURN QUERY against a RETURNS TABLE(...) signature
-- requires an exact type match; admin_profiles.id/name/role/status/
-- created_at/invited_by all already matched (uuid/text/text/text/
-- timestamptz/uuid respectively) — only au.email did not.
--
-- Fix: cast au.email to text in the SELECT list. Nothing else changes —
-- same RETURNS TABLE signature, same NULL-safe `v_role is null or ...`
-- authorization guard from the previous corrective fix, same SECURITY
-- DEFINER/search_path, same join, same ordering, same grant. Bodies are
-- otherwise byte-identical to 20260818140001 (as corrected) — matching
-- this project's own established pattern for corrective fixes (see
-- 20260810130001_fix_download_token_functions_search_path.sql: a new
-- migration, not an edit to the already-applied one).
create or replace function public.list_admin_profiles()
returns table (
  id uuid,
  email text,
  name text,
  role text,
  status text,
  created_at timestamptz,
  invited_by uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := public.current_admin_role();
begin
  -- NULL-safe on purpose: `x NOT IN (...)` evaluates to NULL (not TRUE)
  -- when x is NULL, and `IF NULL THEN` is treated as false in PL/pgSQL —
  -- so a caller with no role at all (no admin_profiles row, or a
  -- suspended admin) would silently fall through this check instead of
  -- being denied. The explicit `v_role is null or` guard closes that gap:
  -- an unknown/NULL role is always denied, never passed through by
  -- three-valued logic.
  if v_role is null or v_role not in ('owner', 'super_admin') then
    raise exception 'Only the owner or a super admin may list admin profiles.';
  end if;

  return query
    select ap.id, au.email::text, ap.name, ap.role, ap.status, ap.created_at, ap.invited_by
    from public.admin_profiles ap
    join auth.users au on au.id = ap.id
    order by ap.created_at asc;
end;
$$;

grant execute on function public.list_admin_profiles() to authenticated;

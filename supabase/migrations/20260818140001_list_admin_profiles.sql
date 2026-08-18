-- Admin Security Hardening — Phase 2B: PROPOSED, NOT YET APPLIED.
--
-- The one genuinely new backend piece Phase 2B's Admin Users UI needs and
-- the existing Phase 1/2A foundation doesn't provide: a way for the
-- browser to see each admin's real email address.
--
-- admin_profiles itself has no email column (by design — id IS
-- auth.users.id, so email always lives in auth.users). auth.users is not
-- exposed through the public Data API at all (supabase/config.toml's
-- api.schemas is ["public", "graphql_public"] only), so no amount of RLS
-- on admin_profiles alone can make emails visible to a normal client
-- query — the join has to happen server-side, inside a SECURITY DEFINER
-- function, exactly like platform_ownership's seed step and every other
-- auth.users join in this project already does.
--
-- Read-only: no table is created, no column is added, no existing
-- function/policy is touched. Scoped to owner/super_admin, matching
-- admin_profiles_select_owner_or_super_admin's own existing scope (Phase
-- 1) for full-roster visibility.
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
    select ap.id, au.email, ap.name, ap.role, ap.status, ap.created_at, ap.invited_by
    from public.admin_profiles ap
    join auth.users au on au.id = ap.id
    order by ap.created_at asc;
end;
$$;

grant execute on function public.list_admin_profiles() to authenticated;

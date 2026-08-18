-- Phase 2 of the authorization work: the Postgres-side equivalent of the
-- frontend's effective-permission calculation
-- (src/admin/lib/effectivePermissions.ts's hasEffectivePermission()).
-- Function-only — no RLS policy is touched here; nothing yet calls this
-- function from a policy. That's the next, separate phase.
--
-- Mirrors the frontend exactly:
--   - owner -> always true (matches current_admin_role()'s own role model:
--     owner has no role_permissions rows at all, by design).
--   - dashboard.view -> always true regardless of role or any stored
--     override, matching CORE_PERMISSIONS in effectivePermissions.ts (the
--     dashboard is the post-login landing page; a stale revoke override
--     must never strand a real admin on it).
--   - otherwise: an explicit user_permission_overrides row for this exact
--     (caller, permission) pair wins outright (granted=true -> true,
--     granted=false -> false) over whatever role_permissions says.
--   - no override -> fall back to whether the caller's role has this
--     permission in role_permissions.
--   - no role_permissions row and no override -> false.
--
-- Security: derives the caller strictly from auth.uid() (same as
-- current_admin_role()) — no user_id parameter, so a caller can never ask
-- about another user's permissions. SECURITY DEFINER + a pinned
-- search_path, matching current_admin_role()'s own established pattern
-- (also the safest option here: it lets this function work identically
-- regardless of what RLS later does or doesn't allow the caller to read
-- directly from these three tables, exactly like current_admin_role()
-- already does today).
create or replace function public.has_permission(p_permission text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_override boolean;
begin
  if v_uid is null then
    return false;
  end if;

  select role into v_role
  from public.admin_profiles
  where id = v_uid and status = 'active';

  if v_role is null then
    return false;
  end if;

  if v_role = 'owner' then
    return true;
  end if;

  if p_permission = 'dashboard.view' then
    return true;
  end if;

  select granted into v_override
  from public.user_permission_overrides
  where user_id = v_uid and permission = p_permission;

  if v_override is not null then
    return v_override;
  end if;

  return exists (
    select 1 from public.role_permissions
    where role = v_role and permission = p_permission
  );
end;
$$;

revoke execute on function public.has_permission(text) from public;
revoke execute on function public.has_permission(text) from anon;
grant execute on function public.has_permission(text) to authenticated;

-- Admin Users page — invitation trash (restore/permanent delete) + per-user
-- permission overrides. Two genuinely missing capabilities, confirmed via
-- live inspection before writing this file:
--   - user_permission_overrides has exactly one RLS policy (SELECT) — no
--     INSERT/UPDATE/DELETE policy, and no existing RPC writes to it.
--   - admin_invitations has exactly one RLS policy (SELECT, owner-only) —
--     restore/permanent-delete need their own SECURITY DEFINER functions,
--     same as every other invitation mutation in this project.
-- Every function below follows the exact conventions already established
-- and already live: SECURITY DEFINER, set search_path = public, the
-- NULL-safe owner check (`is null or <> 'owner'`) from
-- 20260818170001, an admin_audit_log write, and explicit
-- revoke-from-public/anon + grant-to-authenticated immediately after
-- creation. No existing function, table, policy, or grant is modified.

-- ════════════════════════════════════════════════════════════════════════
-- 1. restore_admin_invitation — owner-only; revoked/expired -> pending
-- ════════════════════════════════════════════════════════════════════════
-- Preserves the original token_hash (the original invitation email's link
-- becomes valid again — no new email needs to be sent) but refreshes
-- expires_at to a fresh 7-day window, since a revoked invitation could be
-- arbitrarily old and restoring an already-dead link would be useless.
-- Re-runs the same two guards create_admin_invitation() already applies —
-- restoring must not be usable to create a second live pending invitation
-- for an email that already has one, or to resurrect access for someone
-- who's since become an active admin through a different invitation.
create or replace function public.restore_admin_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.admin_invitations;
begin
  if public.current_admin_role() is null or public.current_admin_role() <> 'owner' then
    raise exception 'Only the platform owner may restore admin invitations.';
  end if;

  select * into v_invitation from public.admin_invitations where id = p_invitation_id;

  if v_invitation.id is null then
    raise exception 'Invitation not found.';
  end if;

  if v_invitation.status not in ('revoked', 'expired') then
    raise exception 'Only a revoked or expired invitation can be restored (current status: %).', v_invitation.status;
  end if;

  if exists (
    select 1 from public.admin_invitations
    where email = v_invitation.email and status in ('pending', 'accepted') and id <> p_invitation_id
  ) then
    raise exception 'An active invitation already exists for %.', v_invitation.email;
  end if;

  if exists (
    select 1 from public.admin_profiles ap
    join auth.users au on au.id = ap.id
    where au.email = v_invitation.email and ap.status = 'active'
  ) then
    raise exception '% is already an active admin.', v_invitation.email;
  end if;

  update public.admin_invitations
     set status = 'pending',
         expires_at = now() + interval '7 days',
         reviewed_by = null,
         reviewed_at = null
   where id = p_invitation_id;

  insert into public.admin_audit_log (actor_id, action, target_user_id, result, metadata)
  values (
    auth.uid(), 'invitation_restored', null, 'success',
    jsonb_build_object('invitation_id', p_invitation_id, 'email', v_invitation.email)
  );
end;
$$;

revoke execute on function public.restore_admin_invitation(uuid) from public;
revoke execute on function public.restore_admin_invitation(uuid) from anon;
grant execute on function public.restore_admin_invitation(uuid) to authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 2. delete_admin_invitation — owner-only; permanently deletes a
--    revoked/expired row only (never pending/accepted/approved/rejected)
-- ════════════════════════════════════════════════════════════════════════
-- admin_audit_log has no foreign key to admin_invitations (invitation_id
-- lives only inside metadata jsonb on every existing invitation action),
-- so this delete cannot cascade into audit history — confirmed structural,
-- not just conventional. Restricting to revoked/expired status is an
-- additional safeguard: this function can never remove a pending,
-- accepted, approved, or rejected row, even for the owner.
create or replace function public.delete_admin_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.admin_invitations;
begin
  if public.current_admin_role() is null or public.current_admin_role() <> 'owner' then
    raise exception 'Only the platform owner may permanently delete admin invitations.';
  end if;

  select * into v_invitation from public.admin_invitations where id = p_invitation_id;

  if v_invitation.id is null then
    raise exception 'Invitation not found.';
  end if;

  if v_invitation.status not in ('revoked', 'expired') then
    raise exception 'Only a revoked or expired invitation can be permanently deleted (current status: %).', v_invitation.status;
  end if;

  delete from public.admin_invitations where id = p_invitation_id;

  insert into public.admin_audit_log (actor_id, action, target_user_id, result, metadata)
  values (
    auth.uid(), 'invitation_deleted', null, 'success',
    jsonb_build_object('invitation_id', p_invitation_id, 'email', v_invitation.email)
  );
end;
$$;

revoke execute on function public.delete_admin_invitation(uuid) from public;
revoke execute on function public.delete_admin_invitation(uuid) from anon;
grant execute on function public.delete_admin_invitation(uuid) to authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 3. set_user_permission_override — owner-only; the only write path for
--    user_permission_overrides (RLS on that table remains SELECT-only)
-- ════════════════════════════════════════════════════════════════════════
-- p_granted = true/false -> upsert an explicit grant/revoke.
-- p_granted = NULL -> delete the override row entirely ("reset to role
-- default"): with no override row, the effective permission is whatever
-- the user's role grants, computed client-side from role_permissions +
-- this table — no change needed to that computation, it already reads
-- both directly.
create or replace function public.set_user_permission_override(
  p_user_id uuid,
  p_permission text,
  p_granted boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_admin_role() is null or public.current_admin_role() <> 'owner' then
    raise exception 'Only the platform owner may change a user''s permission overrides.';
  end if;

  if p_user_id = (select owner_profile_id from public.platform_ownership) then
    raise exception 'The platform owner''s permissions cannot be overridden.';
  end if;

  if not exists (select 1 from public.admin_profiles where id = p_user_id) then
    raise exception 'Admin profile not found.';
  end if;

  if not exists (select 1 from public.role_permissions where permission = p_permission) then
    raise exception 'Unknown permission: %', p_permission;
  end if;

  if p_granted is null then
    delete from public.user_permission_overrides
     where user_id = p_user_id and permission = p_permission;

    insert into public.admin_audit_log (actor_id, action, target_user_id, result, metadata)
    values (
      auth.uid(), 'permission_override_reset', p_user_id, 'success',
      jsonb_build_object('permission', p_permission)
    );
  else
    insert into public.user_permission_overrides (user_id, permission, granted)
    values (p_user_id, p_permission, p_granted)
    on conflict (user_id, permission) do update set granted = excluded.granted;

    insert into public.admin_audit_log (actor_id, action, target_user_id, result, metadata)
    values (
      auth.uid(), 'permission_override_changed', p_user_id, 'success',
      jsonb_build_object('permission', p_permission, 'granted', p_granted)
    );
  end if;
end;
$$;

revoke execute on function public.set_user_permission_override(uuid, text, boolean) from public;
revoke execute on function public.set_user_permission_override(uuid, text, boolean) from anon;
grant execute on function public.set_user_permission_override(uuid, text, boolean) to authenticated;

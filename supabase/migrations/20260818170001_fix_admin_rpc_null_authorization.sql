-- Admin Security Hardening — corrective fix: NULL authorization bypass in
-- every owner-only admin RPC, plus overly broad EXECUTE grants.
--
-- Root cause, confirmed live (read-only, no function calls) before writing
-- this migration:
--   select (public.current_admin_role() <> 'owner');  -- returns NULL, not true/false
-- Every owner-only function below guards itself with
-- `if public.current_admin_role() <> 'owner' then raise exception ...`.
-- current_admin_role() returns NULL (not an error) for any caller with no
-- matching admin_profiles row — e.g. a signed-up-but-not-yet-approved
-- invitee, or an anonymous request. `NULL <> 'owner'` evaluates to NULL in
-- three-valued SQL logic, and PL/pgSQL treats a NULL `IF` condition as
-- false — so the RAISE EXCEPTION is silently skipped and the function
-- proceeds as though the check passed. Same bug class already found and
-- fixed once this project in list_admin_profiles() (20260818150001), just
-- a different comparison shape (`<>` here instead of `not in (...)`).
--
-- Separately confirmed live (read-only): all eight functions below are
-- also EXECUTE-granted to PUBLIC and anon — Postgres's default grant on
-- function creation, never explicitly revoked in the migrations that
-- created them. Combined with the bug above, an unauthenticated request
-- could in principle reach these functions with the owner check bypassed.
--
-- accept_admin_invitation() was inspected separately and is NOT touched
-- here: it has no current_admin_role() gate at all — its authorization is
-- "this real auth.users account's email matches the invitation's email",
-- checked via `v_caller_email is distinct from v_invitation.email`.
-- IS DISTINCT FROM is already NULL-safe (NULL IS DISTINCT FROM any
-- non-null value is true), so an anonymous caller (auth.uid() null,
-- v_caller_email null) is already correctly rejected. It intentionally
-- stays callable by any authenticated user (not owner-only), and its
-- grants are left exactly as-is.
--
-- Every function below is otherwise byte-identical to its live definition
-- (confirmed via pg_get_functiondef before writing this file) — only the
-- owner-check condition changes, from:
--   if public.current_admin_role() <> 'owner' then
-- to:
--   if public.current_admin_role() is null or public.current_admin_role() <> 'owner' then
-- Every existing error message, comment, and code path is preserved
-- exactly.

-- ════════════════════════════════════════════════════════════════════════
-- 1. create_admin_invitation
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.create_admin_invitation(
  p_email text,
  p_role text,
  p_permission_overrides jsonb default '[]'::jsonb
)
returns table (invitation_id uuid, raw_token text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_raw_token text;
  v_token_hash text;
  v_expires_at timestamptz := now() + interval '7 days';
  v_row public.admin_invitations;
begin
  if public.current_admin_role() is null or public.current_admin_role() <> 'owner' then
    raise exception 'Only the platform owner may create admin invitations.';
  end if;

  if p_role not in ('super_admin', 'admin', 'editor', 'analyst') then
    raise exception 'Invalid role for an invitation: %', p_role;
  end if;

  if exists (
    select 1 from public.admin_invitations
    where email = p_email and status in ('pending', 'accepted')
  ) then
    raise exception 'An active invitation already exists for %.', p_email;
  end if;

  if exists (
    select 1 from public.admin_profiles ap
    join auth.users au on au.id = ap.id
    where au.email = p_email and ap.status = 'active'
  ) then
    raise exception '% is already an active admin.', p_email;
  end if;

  v_raw_token := encode(gen_random_bytes(32), 'hex');
  v_token_hash := encode(digest(v_raw_token, 'sha256'), 'hex');

  insert into public.admin_invitations
    (email, role, permission_overrides, token_hash, invited_by, status, expires_at)
  values
    (p_email, p_role, coalesce(p_permission_overrides, '[]'::jsonb), v_token_hash, auth.uid(), 'pending', v_expires_at)
  returning * into v_row;

  insert into public.admin_audit_log (actor_id, action, target_user_id, result, metadata)
  values (
    auth.uid(), 'invitation_created', null, 'success',
    jsonb_build_object('invitation_id', v_row.id, 'email', p_email, 'role', p_role)
  );

  return query select v_row.id, v_raw_token, v_row.expires_at;
end;
$$;

revoke execute on function public.create_admin_invitation(text, text, jsonb) from public;
revoke execute on function public.create_admin_invitation(text, text, jsonb) from anon;
grant execute on function public.create_admin_invitation(text, text, jsonb) to authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 2. approve_admin_invitation
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.approve_admin_invitation(p_invitation_id uuid)
returns public.admin_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.admin_invitations;
  v_profile public.admin_profiles;
  v_owner_profile_id uuid;
begin
  if public.current_admin_role() is null or public.current_admin_role() <> 'owner' then
    raise exception 'Only the platform owner may approve admin invitations.';
  end if;

  select * into v_invitation from public.admin_invitations where id = p_invitation_id;

  if v_invitation.id is null then
    raise exception 'Invitation not found.';
  end if;

  if v_invitation.status <> 'accepted' then
    raise exception 'Only an accepted invitation can be approved (current status: %).', v_invitation.status;
  end if;

  if v_invitation.expires_at <= now() then
    raise exception 'This invitation has expired.';
  end if;

  if v_invitation.accepted_by is null then
    raise exception 'Invitation has no accepted account on record.';
  end if;

  if exists (select 1 from public.admin_profiles where id = v_invitation.accepted_by) then
    raise exception 'This account already has an admin profile.';
  end if;

  select owner_profile_id into v_owner_profile_id from public.platform_ownership;

  insert into public.admin_profiles (id, name, role, status, invited_by)
  values (
    v_invitation.accepted_by,
    coalesce(nullif(split_part(v_invitation.email, '@', 1), ''), v_invitation.email),
    v_invitation.role,
    'active',
    v_invitation.invited_by
  )
  returning * into v_profile;

  update public.admin_invitations
     set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
   where id = v_invitation.id;

  insert into public.admin_audit_log (actor_id, action, target_user_id, result, metadata)
  values (
    auth.uid(), 'invitation_approved', v_profile.id, 'success',
    jsonb_build_object('invitation_id', v_invitation.id, 'email', v_invitation.email, 'role', v_invitation.role)
  );

  return v_profile;
end;
$$;

revoke execute on function public.approve_admin_invitation(uuid) from public;
revoke execute on function public.approve_admin_invitation(uuid) from anon;
grant execute on function public.approve_admin_invitation(uuid) to authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 3. reject_admin_invitation
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.reject_admin_invitation(p_invitation_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.admin_invitations;
begin
  if public.current_admin_role() is null or public.current_admin_role() <> 'owner' then
    raise exception 'Only the platform owner may reject admin invitations.';
  end if;

  select * into v_invitation from public.admin_invitations where id = p_invitation_id;

  if v_invitation.id is null then
    raise exception 'Invitation not found.';
  end if;

  if v_invitation.status not in ('pending', 'accepted') then
    raise exception 'Only a pending or accepted invitation can be rejected (current status: %).', v_invitation.status;
  end if;

  update public.admin_invitations
     set status = 'rejected', reviewed_by = auth.uid(), reviewed_at = now()
   where id = p_invitation_id;

  insert into public.admin_audit_log (actor_id, action, target_user_id, result, metadata)
  values (
    auth.uid(), 'invitation_rejected', null, 'success',
    jsonb_build_object('invitation_id', p_invitation_id, 'email', v_invitation.email, 'reason', p_reason)
  );
end;
$$;

revoke execute on function public.reject_admin_invitation(uuid, text) from public;
revoke execute on function public.reject_admin_invitation(uuid, text) from anon;
grant execute on function public.reject_admin_invitation(uuid, text) to authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 4. suspend_admin
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.suspend_admin(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_admin_role() is null or public.current_admin_role() <> 'owner' then
    raise exception 'Only the platform owner may suspend an admin.';
  end if;

  if p_user_id = (select owner_profile_id from public.platform_ownership) then
    raise exception 'The platform owner cannot be suspended.';
  end if;

  if not exists (select 1 from public.admin_profiles where id = p_user_id) then
    raise exception 'Admin profile not found.';
  end if;

  update public.admin_profiles set status = 'suspended' where id = p_user_id;

  insert into public.admin_audit_log (actor_id, action, target_user_id, result, metadata)
  values (auth.uid(), 'admin_suspended', p_user_id, 'success', '{}'::jsonb);
end;
$$;

revoke execute on function public.suspend_admin(uuid) from public;
revoke execute on function public.suspend_admin(uuid) from anon;
grant execute on function public.suspend_admin(uuid) to authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 5. reactivate_admin
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.reactivate_admin(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_admin_role() is null or public.current_admin_role() <> 'owner' then
    raise exception 'Only the platform owner may reactivate an admin.';
  end if;

  if not exists (select 1 from public.admin_profiles where id = p_user_id) then
    raise exception 'Admin profile not found.';
  end if;

  update public.admin_profiles set status = 'active' where id = p_user_id;

  insert into public.admin_audit_log (actor_id, action, target_user_id, result, metadata)
  values (auth.uid(), 'admin_reactivated', p_user_id, 'success', '{}'::jsonb);
end;
$$;

revoke execute on function public.reactivate_admin(uuid) from public;
revoke execute on function public.reactivate_admin(uuid) from anon;
grant execute on function public.reactivate_admin(uuid) to authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 6. change_admin_role
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.change_admin_role(p_user_id uuid, p_new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_role text;
begin
  if public.current_admin_role() is null or public.current_admin_role() <> 'owner' then
    raise exception 'Only the platform owner may change an admin''s role.';
  end if;

  if p_new_role = 'owner' or p_new_role not in ('super_admin', 'admin', 'editor', 'analyst') then
    raise exception 'Invalid target role: %. Ownership can only change via a dedicated transfer process.', p_new_role;
  end if;

  if p_user_id = (select owner_profile_id from public.platform_ownership) then
    raise exception 'The platform owner''s role cannot be changed here. Use ownership transfer instead.';
  end if;

  select role into v_old_role from public.admin_profiles where id = p_user_id;

  if v_old_role is null then
    raise exception 'Admin profile not found.';
  end if;

  update public.admin_profiles set role = p_new_role where id = p_user_id;

  insert into public.admin_audit_log (actor_id, action, target_user_id, result, metadata)
  values (
    auth.uid(), 'admin_role_changed', p_user_id, 'success',
    jsonb_build_object('old_role', v_old_role, 'new_role', p_new_role)
  );
end;
$$;

revoke execute on function public.change_admin_role(uuid, text) from public;
revoke execute on function public.change_admin_role(uuid, text) from anon;
grant execute on function public.change_admin_role(uuid, text) to authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 7. revoke_admin_invitation
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.revoke_admin_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.admin_invitations;
begin
  if public.current_admin_role() is null or public.current_admin_role() <> 'owner' then
    raise exception 'Only the platform owner may revoke admin invitations.';
  end if;

  select * into v_invitation from public.admin_invitations where id = p_invitation_id;

  if v_invitation.id is null then
    raise exception 'Invitation not found.';
  end if;

  if v_invitation.status <> 'pending' then
    raise exception 'Only a pending invitation can be revoked (current status: %).', v_invitation.status;
  end if;

  update public.admin_invitations
     set status = 'revoked', reviewed_by = auth.uid(), reviewed_at = now()
   where id = p_invitation_id;

  insert into public.admin_audit_log (actor_id, action, target_user_id, result, metadata)
  values (
    auth.uid(), 'invitation_revoked', null, 'success',
    jsonb_build_object('invitation_id', p_invitation_id, 'email', v_invitation.email)
  );
end;
$$;

revoke execute on function public.revoke_admin_invitation(uuid) from public;
revoke execute on function public.revoke_admin_invitation(uuid) from anon;
grant execute on function public.revoke_admin_invitation(uuid) to authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 8. resend_admin_invitation
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.resend_admin_invitation(p_invitation_id uuid)
returns table (invitation_id uuid, raw_token text, expires_at timestamptz, email text, role text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_old public.admin_invitations;
  v_raw_token text;
  v_token_hash text;
  v_expires_at timestamptz := now() + interval '7 days';
  v_new public.admin_invitations;
begin
  if public.current_admin_role() is null or public.current_admin_role() <> 'owner' then
    raise exception 'Only the platform owner may resend admin invitations.';
  end if;

  select * into v_old from public.admin_invitations where id = p_invitation_id;

  if v_old.id is null then
    raise exception 'Invitation not found.';
  end if;

  if v_old.status <> 'pending' then
    raise exception 'Only a pending invitation can be resent (current status: %).', v_old.status;
  end if;

  -- Same guard create_admin_invitation() applies — resend must not become a
  -- way to route around "this email is already an active admin."
  if exists (
    select 1 from public.admin_profiles ap
    join auth.users au on au.id = ap.id
    where au.email = v_old.email and ap.status = 'active'
  ) then
    raise exception '% is already an active admin.', v_old.email;
  end if;

  update public.admin_invitations
     set status = 'revoked', reviewed_by = auth.uid(), reviewed_at = now()
   where id = v_old.id;

  v_raw_token := encode(gen_random_bytes(32), 'hex');
  v_token_hash := encode(digest(v_raw_token, 'sha256'), 'hex');

  insert into public.admin_invitations
    (email, role, permission_overrides, token_hash, invited_by, status, expires_at)
  values
    (v_old.email, v_old.role, v_old.permission_overrides, v_token_hash, auth.uid(), 'pending', v_expires_at)
  returning * into v_new;

  insert into public.admin_audit_log (actor_id, action, target_user_id, result, metadata)
  values (
    auth.uid(), 'invitation_resent', null, 'success',
    jsonb_build_object(
      'old_invitation_id', v_old.id,
      'new_invitation_id', v_new.id,
      'email', v_new.email,
      'role', v_new.role
    )
  );

  return query select v_new.id, v_raw_token, v_new.expires_at, v_new.email, v_new.role;
end;
$$;

revoke execute on function public.resend_admin_invitation(uuid) from public;
revoke execute on function public.resend_admin_invitation(uuid) from anon;
grant execute on function public.resend_admin_invitation(uuid) to authenticated;

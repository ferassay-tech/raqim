-- Admin Security Hardening — Phase 2A: OWNER-CONTROLLED INVITATIONS,
-- PENDING APPROVAL, ADMIN LIFECYCLE, AUDITABLE SECURITY ACTIONS.
--
-- Scope: schema additions to admin_invitations (the Phase 1 table didn't
-- carry enough state for a real three-stage lifecycle — see below), plus
-- 7 SECURITY DEFINER functions that are the ONLY path to every sensitive
-- mutation this phase introduces. No frontend, routing, nav, or existing
-- CRUD/RLS policy is touched. current_admin_role()/admin_profiles/
-- platform_ownership are read, never redefined.
--
-- Lifecycle model (three stages, matching the approved Phase 2A spec's
-- "pending invitation → accepted → approved/active admin" exactly, and
-- using all four named functions — create/approve/reject/accept — as
-- genuinely distinct steps rather than collapsing create+approve into one):
--
--   1. create_admin_invitation()  — owner only. Row starts 'pending'.
--   2. accept_admin_invitation()  — the invitee, once they've signed in via
--      real Supabase Auth. Proves "this real auth.users account is the
--      invited email" and marks 'accepted'. Does NOT create admin_profiles.
--   3. approve_admin_invitation() / reject_admin_invitation() — owner only,
--      a second, independent decision point. Only approve creates the
--      admin_profiles row (real access). Reject never does.
--
-- This means a person who has both received the invitation AND
-- successfully authenticated as that email still has zero admin access
-- until the owner takes a second, explicit action — directly satisfying
-- "an invited email must not receive admin privileges until the approval
-- operation succeeds."

-- ════════════════════════════════════════════════════════════════════════
-- 1. admin_invitations — widen status vocabulary, add lifecycle columns
-- ════════════════════════════════════════════════════════════════════════

-- Confirmed live (2026-08-18): the only check on `status` is
-- admin_invitations_status_check, allowing ('pending','accepted','revoked',
-- 'expired') — no 'approved'/'rejected'. Same dynamic-lookup technique as
-- the Phase 1 migration, not a hardcoded name, though the name is already
-- confirmed correct.
do $$
declare
  v_conname text;
begin
  select conname into v_conname
  from pg_constraint
  where conrelid = 'public.admin_invitations'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%status%';
  if v_conname is not null then
    execute format('alter table public.admin_invitations drop constraint %I', v_conname);
  end if;
end $$;

alter table public.admin_invitations
  add constraint admin_invitations_status_check
  check (status in ('pending', 'accepted', 'approved', 'rejected', 'revoked', 'expired'));

-- accepted_by: the real auth.users id that actually redeemed the token —
-- recorded by accept_admin_invitation(), read by approve_admin_invitation()
-- to know exactly which account to attach the new admin_profiles row to.
-- Deliberately NOT re-deriving this from `email` at approval time (a
-- second lookup could theoretically resolve to a different account than
-- the one that actually proved ownership of the invited email).
alter table public.admin_invitations
  add column if not exists accepted_by uuid references auth.users(id);

-- reviewed_by / reviewed_at: who (which admin_profiles row) and when the
-- owner's approve/reject decision happened — distinct from invited_by
-- (who created the invitation), so the two can differ once a future phase
-- lets more than the owner create invitations.
alter table public.admin_invitations
  add column if not exists reviewed_by uuid references public.admin_profiles(id),
  add column if not exists reviewed_at timestamptz;

-- Owner-only read access — safe, minimal addition (nothing could read
-- this table at all before; every function below is SECURITY DEFINER and
-- doesn't need this policy to work, but the owner needs a normal client
-- query path to see pending/accepted invitations awaiting review).
create policy admin_invitations_select_owner
  on public.admin_invitations for select
  to authenticated
  using (public.current_admin_role() = 'owner');

-- ════════════════════════════════════════════════════════════════════════
-- 2. create_admin_invitation — owner-only
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
  if public.current_admin_role() <> 'owner' then
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

grant execute on function public.create_admin_invitation(text, text, jsonb) to authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 3. accept_admin_invitation — the invitee, any authenticated user
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.accept_admin_invitation(p_token text)
returns public.admin_invitations
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text := encode(digest(p_token, 'sha256'), 'hex');
  v_invitation public.admin_invitations;
  v_caller_email text;
begin
  select * into v_invitation
  from public.admin_invitations
  where token_hash = v_hash
    and status = 'pending'
    and expires_at > now();

  if v_invitation.id is null then
    raise exception 'This invitation link is invalid or has expired.';
  end if;

  select email into v_caller_email from auth.users where id = auth.uid();

  if v_caller_email is distinct from v_invitation.email then
    raise exception 'This invitation was issued to a different email address.';
  end if;

  update public.admin_invitations
     set status = 'accepted', accepted_at = now(), accepted_by = auth.uid()
   where id = v_invitation.id
  returning * into v_invitation;

  -- actor_id stays NULL here on purpose: the person accepting is not yet
  -- (and may never become) a real admin_profiles row, and actor_id has a
  -- foreign key to admin_profiles — the real identity is captured in
  -- metadata instead.
  insert into public.admin_audit_log (actor_id, action, target_user_id, result, metadata)
  values (
    null, 'invitation_accepted', null, 'success',
    jsonb_build_object('invitation_id', v_invitation.id, 'email', v_invitation.email, 'accepted_by_auth_id', auth.uid())
  );

  return v_invitation;
end;
$$;

grant execute on function public.accept_admin_invitation(text) to authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 4. approve_admin_invitation — owner-only; the ONLY path that ever
--    creates a new admin_profiles row from an invitation
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
  if public.current_admin_role() <> 'owner' then
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

grant execute on function public.approve_admin_invitation(uuid) to authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 5. reject_admin_invitation — owner-only; never creates admin_profiles
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
  if public.current_admin_role() <> 'owner' then
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

grant execute on function public.reject_admin_invitation(uuid, text) to authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 6. suspend_admin / reactivate_admin — owner-only, owner-protected
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.suspend_admin(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_admin_role() <> 'owner' then
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

grant execute on function public.suspend_admin(uuid) to authenticated;

create or replace function public.reactivate_admin(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_admin_role() <> 'owner' then
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

grant execute on function public.reactivate_admin(uuid) to authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 7. change_admin_role — owner-only; can never target or grant 'owner'
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
  if public.current_admin_role() <> 'owner' then
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

grant execute on function public.change_admin_role(uuid, text) to authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- Notes on what this migration deliberately does NOT do
-- ════════════════════════════════════════════════════════════════════════
-- - No function here durably audit-logs a DENIED/unauthorized attempt: a
--   RAISE EXCEPTION aborts the whole transaction, including any audit
--   INSERT attempted earlier in the same call — logging denials safely
--   would need an autonomous-transaction mechanism this project doesn't
--   have yet. None of Phase 2A's required audit actions (G) are
--   denial-type events, so this is a scoped, not-forgotten gap, not a
--   silent one.
-- - No revoke_admin_invitation() function — 'revoked' remains a valid
--   status (inherited from Phase 1) reserved for a future UI action, not
--   built here since it wasn't in the required function list.
-- - No automatic email dispatch is wired from these functions — sending
--   email from inside Postgres needs pg_net/webhook infrastructure this
--   project doesn't have configured, and the invitee-facing accept-link
--   UI these emails would point to doesn't exist until Phase 2B. See
--   api/send-admin-notification.ts (added alongside this migration) for
--   the ready-to-call, secure notification endpoint — wiring it to fire
--   automatically is Phase 2B/2C work.

-- Admin Security Hardening — Phase 2C follow-up: invitation resend/revoke.
--
-- Problem confirmed live: create_admin_invitation() (20260818130001) blocks
-- a new invitation while one is already 'pending' or 'accepted' for that
-- email — correct as a duplicate-prevention rule, but there was no way to
-- get out of 'pending' short of the invitation expiring, so a mistyped
-- email, a lost invite email, or simply wanting to re-send blocked the
-- owner permanently. This migration adds the missing exit: two new
-- SECURITY DEFINER functions, no change to any existing function, table,
-- policy, or check constraint (admin_invitations_status_check already
-- allows 'revoked' — added in 20260818130001 — so no constraint change is
-- needed here either).
--
-- Lifecycle added:
--   revoke_admin_invitation(id)  — owner-only. pending -> revoked. Row is
--     kept (audit trail), never deleted. Once revoked, the email no longer
--     matches create_admin_invitation()'s `status in ('pending','accepted')`
--     duplicate check, so a fresh invitation can be created normally.
--   resend_admin_invitation(id)  — owner-only. Atomically revokes the old
--     pending row and creates a brand-new one (new token, new 7-day
--     expiry, same email/role) in a single function call/transaction, so
--     there's never a window where the old token is still valid alongside
--     a new one. Returns the new invitation's id/token/expiry/email/role so
--     the caller can immediately POST to /api/send-admin-invitation with
--     it, exactly like create_admin_invitation()'s return shape.
--
-- Both functions are owner-only, both write to admin_audit_log (matching
-- every other mutation in 20260818130001), and both only ever act on a
-- currently-'pending' invitation — an accepted/approved/rejected/already-
-- revoked row is left untouched, so this cannot be used to route around
-- approve_admin_invitation()'s "only an accepted invitation can be
-- approved" rule or resurrect a decided invitation.

-- ════════════════════════════════════════════════════════════════════════
-- 1. revoke_admin_invitation — owner-only; pending -> revoked
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
  if public.current_admin_role() <> 'owner' then
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

grant execute on function public.revoke_admin_invitation(uuid) to authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 2. resend_admin_invitation — owner-only; revokes old pending row,
--    creates a fresh one (new token, new expiry) for the same email/role
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
  if public.current_admin_role() <> 'owner' then
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

grant execute on function public.resend_admin_invitation(uuid) to authenticated;

-- Admin payment-confirmation notification system (Phase 7).
--
-- 1) notification_preferences on admin_profiles — additive, JSONB so future
--    notification types are new keys, never new columns/migrations. Absent
--    key reads as "off": adding this column grants nobody anything.
--
-- 2) set_admin_notification_preference() — owner-only RPC, matching
--    change_admin_role()'s exact security template (NULL-safe owner check,
--    SECURITY DEFINER, audit-logged). admin_profiles is never written
--    directly by client code anywhere in this project (see
--    AdminUsersContext.tsx's own header comment) — this preserves that
--    convention rather than opening a new direct-write path. Deliberately
--    owner-only, not self-service per admin: the only existing write
--    policy on admin_profiles (admin_profiles_write_owner) is already
--    owner-only for every column, and widening that is a real RLS change
--    not being made here.
--
-- 3) list_admin_profiles() gains notification_preferences in its return —
--    same security check, same everything else. Postgres does not allow
--    CREATE OR REPLACE to change a function's return type, so this is a
--    DROP + CREATE; the original had no explicit REVOKE/GRANT (relies on
--    Postgres's default PUBLIC-EXECUTE, safe because the function's own
--    internal role check is the actual gate, confirmed live before writing
--    this), so none is re-added — behavior is preserved exactly.
--
-- 4) order_notification_claims — the atomic duplicate-send guard. A
--    composite primary key (order_id, notification_key) is the claim:
--    Postgres serializes concurrent INSERTs for the same key, so exactly
--    one concurrent sender ever succeeds; every other one gets a
--    deterministic unique-violation, not a race window. Server-only by
--    design: RLS enabled, zero policies for anon/authenticated — only the
--    service-role client (used exclusively in the new
--    api/send-admin-payment-notification.ts) ever touches it.

alter table public.admin_profiles
  add column notification_preferences jsonb not null default '{}'::jsonb;

create function public.set_admin_notification_preference(p_user_id uuid, p_key text, p_enabled boolean)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if public.current_admin_role() is null or public.current_admin_role() <> 'owner' then
    raise exception 'Only the platform owner may change notification preferences.';
  end if;

  if p_key !~ '^[a-z_]+$' then
    raise exception 'Invalid notification key: %.', p_key;
  end if;

  if not exists (select 1 from public.admin_profiles where id = p_user_id) then
    raise exception 'Admin profile not found.';
  end if;

  update public.admin_profiles
  set notification_preferences = jsonb_set(
    coalesce(notification_preferences, '{}'::jsonb),
    array[p_key],
    to_jsonb(p_enabled),
    true
  )
  where id = p_user_id;

  insert into public.admin_audit_log (actor_id, action, target_user_id, result, metadata)
  values (
    auth.uid(), 'admin_notification_preference_changed', p_user_id, 'success',
    jsonb_build_object('key', p_key, 'enabled', p_enabled)
  );
end;
$function$;

revoke all on function public.set_admin_notification_preference(uuid, text, boolean) from public;
grant execute on function public.set_admin_notification_preference(uuid, text, boolean) to authenticated;

drop function public.list_admin_profiles();

create function public.list_admin_profiles()
returns table(
  id uuid,
  email text,
  name text,
  role text,
  status text,
  created_at timestamptz,
  invited_by uuid,
  notification_preferences jsonb
)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_role text := public.current_admin_role();
begin
  if v_role is null or v_role not in ('owner', 'super_admin') then
    raise exception 'Only the owner or a super admin may list admin profiles.';
  end if;

  return query
    select ap.id, au.email::text, ap.name, ap.role, ap.status, ap.created_at, ap.invited_by, ap.notification_preferences
    from public.admin_profiles ap
    join auth.users au on au.id = ap.id
    order by ap.created_at asc;
end;
$function$;

create table public.order_notification_claims (
  order_id text not null references public.orders(id) on delete cascade,
  notification_key text not null,
  claimed_at timestamptz not null default now(),
  primary key (order_id, notification_key)
);

alter table public.order_notification_claims enable row level security;
-- No policies for anon/authenticated — this table carries no customer
-- data and no recipient list, only a claim marker; only the service-role
-- connection in api/send-admin-payment-notification.ts ever reads/writes
-- it, and service role bypasses RLS entirely.

-- Backend authorization hardening, table 11 of N: public.site_settings.
-- site_settings_select_anon is deliberately NOT touched: qual = true with
-- no current_admin_role() reference at all, roles {anon,authenticated} —
-- genuinely, deliberately public (site name, SEO, currency, etc., read
-- everywhere including the public storefront), not a byproduct of an
-- admin-authorization pattern that needs splitting. Not part of the
-- legacy role-based pattern this hardening replaces.
--
-- site_settings_write_owner -> settings.manage (confirmed live in
-- role_permissions: super_admin only — NOT admin, NOT editor). Widens
-- write access for super_admin to match the seed; nothing that could
-- write before (only owner) loses access, since owner still passes via
-- has_permission()'s owner bypass. No other predicate exists in this
-- policy beyond the role check.

alter policy site_settings_write_owner on public.site_settings
  using (has_permission('settings.manage'))
  with check (has_permission('settings.manage'));

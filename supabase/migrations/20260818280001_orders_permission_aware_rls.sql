-- Backend authorization hardening, table 8 of N: public.orders.
-- orders_insert_checkout is deliberately NOT touched: it has no role
-- check at all (roles {anon,authenticated}, with_check restricted to
-- status='pending' AND discount>=0) — the public checkout path, not part
-- of the legacy admin role-based pattern this hardening replaces.
--
-- orders_select_authenticated -> orders.view (confirmed live: granted to
-- admin, analyst, super_admin — NOT editor. Analyst gaining read access
-- and editor losing it both correctly match the seed instead of the old
-- hardcoded editor/owner-only check).
-- orders_update_editor_or_owner -> orders.manage (confirmed live: granted
-- to admin, super_admin only — NOT editor).
-- Both confirmed to contain only the role check, no other predicate, so
-- no AND-combination with business logic is needed. No DELETE policy
-- exists on this table.

alter policy orders_select_authenticated on public.orders
  using (has_permission('orders.view'));

alter policy orders_update_editor_or_owner on public.orders
  using (has_permission('orders.manage'))
  with check (has_permission('orders.manage'));

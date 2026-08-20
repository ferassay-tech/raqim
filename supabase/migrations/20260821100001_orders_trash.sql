-- Orders Trash: soft-delete / restore / permanent-delete, mirroring the
-- proven Books pattern (20260806130001_books_table.sql) as closely as
-- possible.
--
-- Soft-delete and restore are plain UPDATEs (setting/clearing deleted_at)
-- and need no new policy: the existing orders_update_editor_or_owner
-- policy (has_permission('orders.manage'), see 20260818280001) already
-- covers writing this column, exactly like every other order field
-- (status, timeline, etc.).
--
-- Permanent delete needs a new policy: orders currently has zero DELETE
-- policy at all (confirmed live before writing this — see
-- 20260818280001_orders_permission_aware_rls.sql's own comment, "No
-- DELETE policy exists on this table"), so every delete is denied by
-- default today. Per explicit instruction this is a hardcoded
-- current_admin_role() = 'owner' check — narrower than the has_permission()
-- system used everywhere else on this table, and narrower than Books'
-- own (later-migrated) has_permission('books.delete') equivalent, which
-- also grants admin/super_admin. Deliberate, not an oversight.
--
-- No deleted_by/restored_at/restored_by columns — orders already has a
-- richer built-in history mechanism Books lacks (the existing `timeline`
-- jsonb column); trash/restore events are recorded there instead,
-- exactly like every other order mutation already records itself.

alter table public.orders add column deleted_at timestamptz;

create index orders_deleted_at_idx on public.orders (deleted_at);

create policy orders_delete_owner
  on public.orders for delete
  to authenticated
  using (current_admin_role() = 'owner');

-- Backend authorization hardening, table 10 of N: public.download_tokens.
-- Permission: library.manage (confirmed live: admin, super_admin only —
-- NOT editor, same as library_files).
--
-- download_tokens_insert_editor_or_owner's with_check combines the role
-- check with a real business rule — EXISTS (select 1 from orders o where
-- o.id = download_tokens.order_id and o.status = 'paid') — a download
-- token may only ever be minted for a paid order. That condition is
-- preserved exactly, combined via AND with has_permission('library.manage')
-- in place of the role check; nothing else about it changes.
-- download_tokens_select_authenticated and _update_editor_or_owner
-- confirmed to contain only the role check, no other predicate. No
-- DELETE policy exists on this table. resolve_download_token() /
-- record_download_token_use() are the separate, unrelated
-- SECURITY DEFINER customer-facing token-resolution path — not RLS
-- policies, not touched.

alter policy download_tokens_select_authenticated on public.download_tokens
  using (has_permission('library.manage'));

alter policy download_tokens_update_editor_or_owner on public.download_tokens
  using (has_permission('library.manage'))
  with check (has_permission('library.manage'));

alter policy download_tokens_insert_editor_or_owner on public.download_tokens
  with check (
    has_permission('library.manage')
    and exists (
      select 1 from orders o
      where o.id = download_tokens.order_id and o.status = 'paid'
    )
  );

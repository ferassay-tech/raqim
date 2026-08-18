-- Backend authorization hardening, table 9 of N: public.conversations.
-- conversations_insert_contact_form is deliberately NOT touched: it has
-- no role check at all (roles {anon,authenticated}, with_check enforces
-- customer_id IS NULL, status='open', unread=true, a single inbound
-- message, and the recent_conversation_count(...) rate limit) — the
-- public contact-form path, not part of the legacy admin role-based
-- pattern this hardening replaces.
--
-- conversations_select_authenticated -> messages.view (confirmed live:
-- admin, super_admin only — NOT editor).
-- conversations_update_editor_or_owner -> messages.reply (the mutating
-- action — replying/marking status/read; confirmed live: admin,
-- super_admin only — NOT editor).
-- Both confirmed to contain only the role check, no other predicate. No
-- DELETE policy exists on this table.

alter policy conversations_select_authenticated on public.conversations
  using (has_permission('messages.view'));

alter policy conversations_update_editor_or_owner on public.conversations
  using (has_permission('messages.reply'))
  with check (has_permission('messages.reply'));

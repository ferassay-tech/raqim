-- Phase 7A (Messages, public intake) — the first anonymous write path
-- Messages has ever had. Additive only; the Phase 6G migration is not
-- edited retroactively.
--
-- recent_conversation_count() is SECURITY DEFINER, mirroring
-- current_admin_role()'s exact pattern from the foundation migration:
-- the INSERT policy below needs to count existing rows across the whole
-- table to rate-limit by email, but anon has no SELECT policy on
-- conversations — without SECURITY DEFINER, a subquery inside the
-- policy would itself be RLS-filtered down to zero rows for anon,
-- silently defeating the rate limit every time.
create or replace function public.recent_conversation_count(p_email text, p_window interval)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from public.conversations
  where customer_email = p_email and created_at > now() - p_window;
$$;

grant execute on function public.recent_conversation_count(text, interval) to anon, authenticated;

-- WITH CHECK pins every anon-submitted row to a harmless initial shape,
-- the same principle as orders_insert_checkout's status = 'pending':
--   - customer_id is null: a forged submission can never claim to *be*
--     an existing real customer, which would otherwise leak that
--     customer's order history into ConversationCustomerPanel for
--     whoever opens the conversation.
--   - status/unread/single-inbound-message: a forged insert can only
--     ever land as an ordinary new conversation, never a pre-fabricated
--     thread with fake outbound/admin messages already in it.
--   - recent_conversation_count(...) < 3 per 24h: basic v1 spam defense,
--     tunable later without any code change.
create policy conversations_insert_contact_form
  on public.conversations for insert
  to anon, authenticated
  with check (
    customer_id is null
    and status = 'open'
    and unread = true
    and jsonb_array_length(messages) = 1
    and messages->0->>'direction' = 'inbound'
    and public.recent_conversation_count(customer_email, interval '24 hours') < 3
  );

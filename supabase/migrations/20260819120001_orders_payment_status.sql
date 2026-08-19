-- Adds a payment-review status distinct from the general order status
-- (paid/pending/refunded/cancelled), so "has an admin reviewed and
-- confirmed this payment" is representable independently of order
-- fulfillment state. App-level values: pending_review | confirmed |
-- rejected (rejected is representable but no admin action sets it yet —
-- only Confirm Payment was requested this phase).
--
-- Nullable, no default: existing orders get NULL — no backfill, no
-- inference of historical payment state. New orders explicitly set
-- payment_status = 'pending_review' at creation (application-level, not a
-- DB default, matching how payment_method_id is already handled).
--
-- No RLS change: orders_update_editor_or_owner already permits any
-- orders.manage-holding admin to update any column, including a new one —
-- same as payment_method_id required none.

alter table public.orders
  add column payment_status text null;

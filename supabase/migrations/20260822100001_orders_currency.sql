-- A1 remediation — adds the transaction currency to orders, alongside
-- (never replacing) the existing numeric unitPrice/discount fields inside
-- items/discount. Every order created through the real checkout flow is
-- now required (at the application layer) to record which of RAQIM's three
-- independent, non-convertible currencies (USD/EGP/ILS) it was actually
-- transacted in — determined solely by the selected payment method
-- (src/config/paymentMethods.ts), never assumed to be USD.
--
-- Nullable, no default, no backfill — mirrors the exact precedent of
-- 20260819110001_orders_payment_method_id.sql: every existing row gets
-- NULL here, and deliberately stays NULL. There is no safe, deterministic
-- way to recover a historical order's true transaction currency (or the
-- true amount it represents) from the row alone — payment_method_id can
-- suggest a likely currency, but the stored unitPrice for a pre-migration
-- EGP/ILS order is the book's USD price at the time (the exact bug this
-- migration's application-layer fix addresses), not the true EGP/ILS
-- amount, so relabeling it here would make a wrong amount look
-- authoritative. See the A1 remediation plan's historical-orders section.
--
-- No RLS change needed: orders_insert_checkout's WITH CHECK only
-- constrains status/discount, not a column allow-list (confirmed live,
-- same reasoning already documented in the payment_method_id migration) —
-- a new nullable column requires no policy update for anon checkout
-- inserts to keep working. orders_select_authenticated/
-- orders_update_editor_or_owner are row-level permission checks,
-- unaffected by an added column.

alter table public.orders
  add column currency text null check (currency in ('USD', 'EGP', 'ILS'));

-- Adds a stable, machine-readable payment method identifier to orders,
-- alongside (not replacing) the existing payment_method display string.
-- payment_method today stores config.title ("Vodafone Cash") — a
-- human-readable snapshot the app already depends on for display; this
-- column stores config.id ("vodafone") from src/config/paymentMethods.ts,
-- the stable key already used everywhere else in the app.
--
-- Nullable, no default: every existing order gets NULL here, which is
-- correct — there is no safe, deterministic way to derive a stable id from
-- the free-text title alone (a title could have been edited/retranslated
-- since an old order was created), so no backfill is attempted. Existing
-- rows keep rendering exactly as before, since nothing reads this column
-- yet and payment_method (the field they already display) is untouched.
--
-- No RLS change needed: orders_insert_checkout's WITH CHECK only
-- constrains status/discount, not a column allow-list, so a new nullable
-- column requires no policy update for anon to keep inserting orders.

alter table public.orders
  add column payment_method_id text null;

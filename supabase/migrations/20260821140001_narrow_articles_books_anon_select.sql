-- Security fix (audit finding P1): narrow anonymous SELECT on
-- articles/books to match each table's own actual, already-existing
-- public-visibility rule, instead of the current unconditional `true`.
--
-- The two tables use genuinely different visibility rules in the real
-- application, confirmed by reading the actual public-facing code before
-- writing this migration — so they deliberately get different USING
-- clauses here, not a shared one:
--
-- articles: BlogIndexPage.tsx, BlogPostPage.tsx, and SearchPage.tsx all
-- independently gate visibility on exactly `status === 'published'`
-- (articles_status_check confirms the live enum is
-- 'draft' | 'published' | 'scheduled'). A direct link to a draft/scheduled
-- article's slug already returns "not found" in the app today — this
-- migration makes RLS agree with that, closing the gap where a draft row
-- was previously readable directly via the anon key/REST API even though
-- no UI ever surfaces it.
--
-- books: the public app's gate is NOT status. SearchPage.tsx filters via
-- `deletedAt === null && isInLibraryGrid(placement)`, and
-- isInLibraryGrid() (src/admin/lib/bookPlacement.ts) excludes only
-- placement = 'hidden' — every other placement (hero/featured/library/
-- comingSoon) is intentionally public, matching the original site's
-- design of showing "coming soon" books in the general catalog.
-- BookForm.tsx confirms `status` and `placement` are independent fields
-- with no cross-field validation coupling them — a book can be legitimately
-- saved with placement other than 'hidden' while status is still 'draft'.
-- Using status = 'published' here (the same clause as articles) would
-- therefore filter on the wrong column and could hide a book the admin
-- has genuinely, validly placed as public. The clause below mirrors the
-- app's real rule instead.
--
-- Only the USING clause of these two policies changes. Role, command,
-- WITH CHECK, and every other policy on either table are untouched. No
-- row, table, function, or grant is modified.

alter policy articles_select_anon on public.articles
  using (status = 'published');

alter policy books_select_anon on public.books
  using (deleted_at is null and placement <> 'hidden');

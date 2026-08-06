-- CMS Phase 6A — Books migration, step 1 of 4 (schema only).
--
-- Scope deliberately narrowed from the original four-module draft to Books
-- alone: no Authors table (author/author_slug/author_bio stay plain fields
-- on the row, exactly like today's AdminBookRaw — there is no separate
-- entity to point a foreign key at yet), no Media/Library changes, no
-- StorageAdapter changes. cover/back_cover_image/gallery/preview_pages stay
-- plain URL strings — confirmed in BookForm.tsx that the editor always
-- calls set("cover", asset.url), never picks a Media asset by id, so there
-- is nothing to normalize even if this migration wanted to.
--
-- category_id is included as a real column here, but this migration does
-- NOT populate it and no runtime code will ever compute it — the mapping
-- from a book's raw category name to a categories.id happens once, offline,
-- in scripts/generate-books-seed.mjs (a later, separate commit), which
-- emits the resolved value directly in its INSERT statements.
create table if not exists public.books (
  id text primary key,

  -- Author identity — plain fields, not a foreign key (see note above).
  author text not null,
  author_slug text not null,
  author_bio jsonb not null,

  -- categories.id is text (e.g. "cat-motherhood"), not uuid — matches the
  -- existing categories table exactly (20260806120001_foundation_tables.sql).
  category_id text references public.categories (id),

  placement text not null check (placement in ('hero', 'featured', 'library', 'comingSoon', 'hidden')),
  display_order integer not null default 0,
  status text not null check (status in ('published', 'draft', 'archived')),

  prices jsonb not null default '{}'::jsonb,
  stock integer not null default 0,
  sku text not null default '',
  pages integer not null default 0,
  sales integer not null default 0,
  accent_color text,

  -- Plain URL strings/arrays — unchanged in shape from today's AdminBookRaw.
  cover text,
  back_cover_image text,
  gallery text[] not null default '{}',
  preview_pages text[] not null default '{}',

  -- Every remaining bilingual/copy field (title, subtitle, description,
  -- longDescription, whoFor, features, chapters, reviews, faq, ctaLabel,
  -- badges, language, format, seoTitle, seoDescription) — one document,
  -- read/written whole via the Book Editor, never queried by sub-field.
  content jsonb not null,

  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_books_updated_at on public.books;
create trigger set_books_updated_at
  before update on public.books
  for each row
  execute function public.set_updated_at();

-- Indexes — matches the exact filter BooksIndexPage/HomePage/AuthorPage
-- already run today (deletedAt === null && isInLibraryGrid(placement)).
create index if not exists books_deleted_at_placement_idx
  on public.books (deleted_at, placement);
create index if not exists books_category_id_idx
  on public.books (category_id);
create index if not exists books_display_order_idx
  on public.books (display_order);

-- RLS — mirrors categories' already-proven policies exactly
-- (20260806120003_foundation_rls.sql): public SELECT, editor/owner write,
-- owner-only DELETE. Ordinary "delete" from the Admin UI stays a soft
-- UPDATE setting deleted_at (matches today's exact behavior); DELETE here
-- maps only to the existing "permanently remove from trash" action.
alter table public.books enable row level security;

create policy books_select_anon
  on public.books for select
  to anon, authenticated
  using (true);

create policy books_insert_editor_or_owner
  on public.books for insert
  to authenticated
  with check (public.current_admin_role() in ('editor', 'owner'));

create policy books_update_editor_or_owner
  on public.books for update
  to authenticated
  using (public.current_admin_role() in ('editor', 'owner'))
  with check (public.current_admin_role() in ('editor', 'owner'));

create policy books_delete_owner
  on public.books for delete
  to authenticated
  using (public.current_admin_role() = 'owner');

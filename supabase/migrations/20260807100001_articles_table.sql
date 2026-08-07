-- Phase 6F (Articles) — new table for the blog. Structurally mirrors
-- books (bilingual jsonb copy fields + plain structural columns); RLS
-- mirrors categories/books exactly since, like those, no anonymous
-- customer ever writes here — only the admin (editor/owner) creates,
-- edits, or deletes posts, and the public blog only ever reads.
--
-- slug gets a unique constraint alongside the id primary key: the two
-- are independent fields (duplicateArticle() deliberately creates a new
-- id while deriving a separate slug), and BlogPostPage.tsx's public
-- routing looks articles up by slug, not id — a duplicate slug would
-- make /blog/:slug genuinely ambiguous. Not a new feature, just
-- preventing a state the app's own routing already assumes can't happen.

create table public.articles (
  id text primary key,
  title jsonb not null,
  slug text not null unique,
  excerpt jsonb not null,
  content jsonb not null,
  cover_image text,
  author text not null,
  category jsonb not null,
  read_time text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'scheduled')),
  scheduled_for date,
  published_at date,
  seo_title jsonb not null,
  seo_description jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index articles_status_idx on public.articles (status);
create index articles_updated_at_idx on public.articles (updated_at);

create trigger set_articles_updated_at
  before update on public.articles
  for each row
  execute function public.set_updated_at();

alter table public.articles enable row level security;

create policy articles_select_anon
  on public.articles for select
  to anon, authenticated
  using (true);

create policy articles_insert_editor_or_owner
  on public.articles for insert
  to authenticated
  with check (current_admin_role() in ('editor', 'owner'));

create policy articles_update_editor_or_owner
  on public.articles for update
  to authenticated
  using (current_admin_role() in ('editor', 'owner'))
  with check (current_admin_role() in ('editor', 'owner'));

create policy articles_delete_owner
  on public.articles for delete
  to authenticated
  using (current_admin_role() = 'owner');

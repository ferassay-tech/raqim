-- Indexes for the CMS Foundation Phase 4 tables. See the Phase 3 report's
-- Table-by-Table Design for the reasoning behind each; tables not listed
-- below need only their primary key / existing unique constraint at this
-- scale (categories, media_folders, admin_profiles, redirects.from_path,
-- site_settings.scope).

create index if not exists media_assets_folder_id_idx
  on public.media_assets (folder_id);

create index if not exists media_assets_type_idx
  on public.media_assets (type);

create index if not exists content_history_entity_idx
  on public.content_history (entity_type, entity_id);

create index if not exists content_history_created_at_idx
  on public.content_history (created_at);

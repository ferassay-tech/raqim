-- CMS Phase 6B (Media, 1 of 3) — schema alignment only, no shape change.
--
-- media_assets.id / media_folders.id (and the media_assets.folder_id
-- foreign key that points at it) were created as uuid in Phase 4's
-- foundation migration. But the application already uses stable, semantic
-- string ids for these records -- e.g. "media-logo", "folder-covers",
-- "media-cover-front" (see src/admin/data/mediaData.ts) -- rather than
-- generated UUIDs. Three of these exact ids ("media-logo", "media-og",
-- "media-favicon") are also checked by MediaContext.tsx's own
-- LEGACY_OFFICIAL_URLS healing logic, so preserving them (not replacing
-- them with generated UUIDs) is required, not just preferred.
--
-- Both tables were verified empty (0 rows each) via a live read-only
-- query immediately before writing this migration, so this type change
-- is lossless -- there is no existing data to convert or lose.
alter table public.media_assets drop constraint if exists media_assets_folder_id_fkey;

alter table public.media_folders alter column id drop default;
alter table public.media_folders alter column id type text using id::text;

alter table public.media_assets alter column id drop default;
alter table public.media_assets alter column id type text using id::text;
alter table public.media_assets alter column folder_id type text using folder_id::text;

-- Re-added with the exact same behavior as the original Phase 4 foreign
-- key (on delete set null) -- structurally unchanged, now compatible
-- with the real string-id data.
alter table public.media_assets
  add constraint media_assets_folder_id_fkey
  foreign key (folder_id) references public.media_folders (id) on delete set null;

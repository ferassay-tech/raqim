import type { AdminMediaAsset, AdminMediaFolder } from "../types/media";
import { createCollectionAdapter } from "../services/data/index.ts";
import type { CollectionAdapter } from "../services/data/index.ts";

/**
 * CMS Phase 6B — repository for both media tables, wired into
 * MediaContext. Uploads stay mock object URLs in this phase (no change
 * to that behavior); only the metadata record moves to Supabase.
 */

export interface MediaFolderRow {
  id: string;
  name: string;
  created_at: string;
}

export interface MediaAssetRow {
  id: string;
  /** media_assets.storage_key is NOT NULL, but this phase never calls a
   * real StorageAdapter (uploads stay mock object URLs) — there is no
   * real "key" to record. Set equal to `url`, mirroring the local
   * StorageAdapter's own documented convention (services/storage/
   * localAdapter.ts: "the object URL itself is the only 'location' that
   * exists, so it doubles as the key"). Becomes meaningful the day a
   * later, separate phase wires real uploads. */
  storage_key: string;
  url: string;
  name: string;
  type: AdminMediaAsset["type"];
  folder_id: string | null;
  size: number;
  width: number | null;
  height: number | null;
  uploaded_at: string;
}

export function folderToSupabaseRow(folder: AdminMediaFolder): MediaFolderRow {
  return { id: folder.id, name: folder.name, created_at: new Date().toISOString() };
}

export function folderFromSupabaseRow(row: MediaFolderRow): AdminMediaFolder {
  return { id: row.id, name: row.name };
}

export function assetToSupabaseRow(asset: AdminMediaAsset): MediaAssetRow {
  return {
    id: asset.id,
    storage_key: asset.url,
    url: asset.url,
    name: asset.name,
    type: asset.type,
    folder_id: asset.folderId,
    size: asset.size,
    width: asset.width,
    height: asset.height,
    uploaded_at: new Date(asset.uploadedAt).toISOString(),
  };
}

export function assetFromSupabaseRow(row: MediaAssetRow): AdminMediaAsset {
  return {
    id: row.id,
    url: row.url,
    name: row.name,
    type: row.type,
    folderId: row.folder_id,
    size: row.size,
    width: row.width,
    height: row.height,
    uploadedAt: row.uploaded_at.slice(0, 10),
  };
}

export const mediaFoldersRepository: CollectionAdapter<MediaFolderRow> = createCollectionAdapter<MediaFolderRow>(
  "supabase",
  "media_folders",
  []
);

export const mediaAssetsRepository: CollectionAdapter<MediaAssetRow> = createCollectionAdapter<MediaAssetRow>(
  "supabase",
  "media_assets",
  []
);

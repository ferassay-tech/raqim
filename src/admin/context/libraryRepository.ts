import type { LibraryFile, LibraryFileFormat } from "../types/library";
import type { StorageProviderId } from "../services/storage";
import { createCollectionAdapter } from "../services/data/index.ts";
import type { CollectionAdapter } from "../services/data/index.ts";

/**
 * CMS Phase 6B — repository for library_files. No seed script: the
 * localStorage-era INITIAL_LIBRARY_FILES is genuinely empty (no digital
 * files have been uploaded yet), so there is nothing to backfill.
 */

export interface LibraryFileRow {
  id: string;
  filename: string;
  format: LibraryFileFormat;
  size: number;
  storage_provider: StorageProviderId;
  storage_key: string;
  preview_url: string | null;
  book_id: string | null;
  version: string | null;
  uploaded_at: string;
  updated_at: string;
}

export function fileToSupabaseRow(file: LibraryFile): LibraryFileRow {
  return {
    id: file.id,
    filename: file.filename,
    format: file.format,
    size: file.size,
    storage_provider: file.storageProvider,
    storage_key: file.storageKey,
    preview_url: file.previewUrl,
    book_id: file.bookId,
    version: file.version,
    uploaded_at: new Date(file.uploadedAt).toISOString(),
    updated_at: new Date(file.updatedAt).toISOString(),
  };
}

export function fileFromSupabaseRow(row: LibraryFileRow): LibraryFile {
  return {
    id: row.id,
    filename: row.filename,
    format: row.format,
    size: row.size,
    storageProvider: row.storage_provider,
    storageKey: row.storage_key,
    previewUrl: row.preview_url,
    bookId: row.book_id,
    version: row.version,
    uploadedAt: row.uploaded_at.slice(0, 10),
    updatedAt: row.updated_at.slice(0, 10),
  };
}

export const libraryFilesRepository: CollectionAdapter<LibraryFileRow> = createCollectionAdapter<LibraryFileRow>(
  "supabase",
  "library_files",
  []
);

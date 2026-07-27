import type { StorageProviderId } from "../services/storage";

export type LibraryFileFormat = "pdf" | "epub" | "mobi" | "zip";

export const LIBRARY_FILE_FORMATS: { value: LibraryFileFormat; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "epub", label: "EPUB" },
  { value: "mobi", label: "MOBI" },
  { value: "zip", label: "ZIP" },
];

export interface LibraryFile {
  id: string;
  filename: string;
  format: LibraryFileFormat;
  /** Bytes. */
  size: number;
  uploadedAt: string;
  updatedAt: string;
  storageProvider: StorageProviderId;
  /** Opaque key/path the storage adapter uses to locate the bytes — never
   * a public static path, never exposed to a customer directly. */
  storageKey: string;
  /** Local-only convenience: an object URL the Admin can preview/download
   * from today. Null once a real provider is active (the adapter resolves
   * a fresh URL on demand instead — see getDownloadUrl). */
  previewUrl: string | null;
  /** Which book this file belongs to, if any — the link Part 3 manages. */
  bookId: string | null;
  /** Free-text edition label ("v1.0", "v2.0"). A new edition is a new
   * LibraryFile record (same bookId, new version) so older editions are
   * never silently replaced — see LibraryContext.uploadFile. */
  version: string | null;
}

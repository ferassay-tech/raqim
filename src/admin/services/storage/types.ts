export type StorageProviderId = "local" | "r2" | "s3" | "supabase";

export interface StorageUploadResult {
  storageKey: string;
  /** Where the Admin can currently preview/download the bytes from. For the
   * local adapter this is a session-scoped object URL; for a real provider
   * this would be a private, non-public location the adapter alone knows
   * how to resolve — never a public static path. */
  url: string;
}

export interface StorageDownloadUrlOptions {
  /** How long a generated download URL should remain valid. Real providers
   * (R2/S3 presigned URLs, Supabase signed URLs) support this natively;
   * the local adapter ignores it today since it has no real expiry
   * mechanism to enforce client-side. */
  expiresInSeconds?: number;
}

/**
 * The seam a real storage provider plugs into. Every provider — including
 * the local one used today — implements exactly this interface, so
 * swapping "local" for "r2"/"s3"/"supabase" later is registering a new
 * adapter in ./index.ts, not touching any code that calls this interface
 * (LibraryContext, DownloadsContext, DownloadPage).
 */
export interface StorageAdapter {
  id: StorageProviderId;
  label: string;
  upload(file: File, key: string): Promise<StorageUploadResult>;
  getDownloadUrl(storageKey: string, opts?: StorageDownloadUrlOptions): Promise<string>;
  delete(storageKey: string): Promise<void>;
}

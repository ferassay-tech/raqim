import type { StorageAdapter, StorageProviderId } from "./types";
import { localAdapter } from "./localAdapter";

export type { StorageAdapter, StorageProviderId, StorageUploadResult, StorageDownloadUrlOptions } from "./types";

function notConfigured(providerId: StorageProviderId): StorageAdapter {
  const fail = (): never => {
    throw new Error(
      `Storage provider "${providerId}" is not configured yet. Implement its StorageAdapter (src/admin/services/storage/types.ts) against the real SDK, register it below, then select it in Settings → Storage.`
    );
  };
  return {
    id: providerId,
    label: `${providerId.toUpperCase()} (غير مُهيّأ بعد)`,
    upload: fail,
    getDownloadUrl: fail,
    delete: fail,
  };
}

/**
 * The provider registry — the concrete form of "keep the storage layer
 * abstract so providers can be swapped later." `local` is the only adapter
 * that actually works today (see localAdapter.ts); the rest are named,
 * selectable stubs that fail loudly and clearly instead of silently, so
 * wiring a real provider later means writing one adapter file and
 * replacing its entry here — nothing else in the app (LibraryContext,
 * DownloadsContext, DownloadPage) changes.
 */
export const STORAGE_ADAPTERS: Record<StorageProviderId, StorageAdapter> = {
  local: localAdapter,
  r2: notConfigured("r2"),
  s3: notConfigured("s3"),
  supabase: notConfigured("supabase"),
};

export const STORAGE_PROVIDER_OPTIONS: { value: StorageProviderId; label: string }[] = [
  { value: "local", label: "تخزين محلي (المتصفح)" },
  { value: "r2", label: "Cloudflare R2" },
  { value: "s3", label: "Amazon S3" },
  { value: "supabase", label: "Supabase Storage" },
];

export function getStorageAdapter(providerId: StorageProviderId): StorageAdapter {
  return STORAGE_ADAPTERS[providerId];
}

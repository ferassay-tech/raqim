import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import type { AdminMediaAsset, AdminMediaFolder } from "../types/media";
import { INITIAL_MEDIA_ASSETS, INITIAL_MEDIA_FOLDERS } from "../data/mediaData";
import { usePersistedState } from "../lib/usePersistedState";

interface MediaContextValue {
  assets: AdminMediaAsset[];
  folders: AdminMediaFolder[];
  addAssets: (files: File[], folderId: string | null) => void;
  renameAsset: (id: string, name: string) => void;
  moveAsset: (id: string, folderId: string | null) => void;
  deleteAsset: (id: string) => void;
  createFolder: (name: string) => void;
  deleteFolder: (id: string) => void;
}

const MediaContext = createContext<MediaContextValue | null>(null);

const today = () => new Date().toISOString().slice(0, 10);

function slugify(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/(^-|-$)/g, "") || "item"
  );
}

/** Known legacy URLs for the three built-in "official" assets whose
 * canonical path has changed since first seeded — used only to detect a
 * persisted entry that still carries an old official URL. Never matches a
 * user upload (those use `media-upload-*` ids, never these three) and is
 * checked by exact URL, so a user-uploaded replacement at one of these ids'
 * own URL would never occur in practice. */
const LEGACY_OFFICIAL_URLS: Record<string, string[]> = {
  "media-logo": ["/logos/lumora-logo-signature.png"],
  "media-og": ["/og-image-2026.png"],
  "media-favicon": ["/favicon.webp"],
};

/**
 * The shared asset store — Books, Articles, and any future module read
 * from and write to this same context rather than keeping their own copies
 * of "what images exist." Uploads are mock (object URLs, session-scoped
 * only) since there's no backend yet, but the shape (ids, metadata, a
 * folderId reference) is what a real upload endpoint would return.
 */
export function MediaProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = usePersistedState<AdminMediaAsset[]>("media_assets", INITIAL_MEDIA_ASSETS);
  const [folders, setFolders] = usePersistedState<AdminMediaFolder[]>("media_folders", INITIAL_MEDIA_FOLDERS);

  // One-time reconciliation, run like a migration: a browser that already
  // persisted `media_assets`/`media_folders` before some entry existed in
  // the seed would otherwise never see it, since the persisted array fully
  // replaces the seed on every load (see usePersistedState) with no merge
  // of its own. This appends only the seed ids missing from what's already
  // persisted — every persisted asset/folder (including user uploads and
  // any edits to a seed item's own fields) is left completely untouched;
  // nothing is ever overwritten, deleted, or duplicated.
  useEffect(() => {
    setAssets((prev) => {
      const knownIds = new Set(prev.map((a) => a.id));
      const missing = INITIAL_MEDIA_ASSETS.filter((seed) => !knownIds.has(seed.id));

      // Heal only the three built-in official assets, and only when their
      // persisted URL is a known legacy value — a user's own upload, rename,
      // or folder move is never touched, since those never match a legacy
      // URL at one of these three ids in the first place. `name`/`folderId`
      // (the user-editable fields) are preserved as-is; only the technical
      // fields that describe *which file this is* (url/width/height/size/
      // type) are brought forward to the current seed.
      let changed = false;
      const healed = prev.map((asset) => {
        const legacyUrls = LEGACY_OFFICIAL_URLS[asset.id];
        if (!legacyUrls?.includes(asset.url)) return asset;
        const seed = INITIAL_MEDIA_ASSETS.find((s) => s.id === asset.id);
        if (!seed) return asset;
        changed = true;
        return { ...asset, url: seed.url, width: seed.width, height: seed.height, size: seed.size, type: seed.type };
      });

      if (missing.length === 0 && !changed) return prev;
      return [...healed, ...missing];
    });
    setFolders((prev) => {
      const knownIds = new Set(prev.map((f) => f.id));
      const missing = INITIAL_MEDIA_FOLDERS.filter((seed) => !knownIds.has(seed.id));
      return missing.length > 0 ? [...prev, ...missing] : prev;
    });
    // Runs once on mount only — this is a startup migration, not a
    // per-render sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addAssets = useCallback((files: File[], folderId: string | null) => {
    const newAssets: AdminMediaAsset[] = files
      .filter((f) => f.type.startsWith("image/"))
      .map((file, i) => ({
        id: `media-upload-${Date.now()}-${i}`,
        url: URL.createObjectURL(file),
        name: file.name.replace(/\.[^.]+$/, ""),
        type: "image",
        folderId,
        size: file.size,
        width: null,
        height: null,
        uploadedAt: today(),
      }));
    setAssets((prev) => [...newAssets, ...prev]);
  }, [setAssets]);

  const renameAsset = useCallback((id: string, name: string) => {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, name } : a)));
  }, [setAssets]);

  const moveAsset = useCallback((id: string, folderId: string | null) => {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, folderId } : a)));
  }, [setAssets]);

  const deleteAsset = useCallback((id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }, [setAssets]);

  const createFolder = useCallback((name: string) => {
    setFolders((prev) => {
      let id = `folder-${slugify(name)}`;
      let n = 2;
      while (prev.some((f) => f.id === id)) {
        id = `folder-${slugify(name)}-${n}`;
        n += 1;
      }
      return [...prev, { id, name }];
    });
  }, [setFolders]);

  const deleteFolder = useCallback((id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setAssets((prev) => prev.map((a) => (a.folderId === id ? { ...a, folderId: null } : a)));
  }, [setFolders, setAssets]);

  const value = useMemo(
    () => ({ assets, folders, addAssets, renameAsset, moveAsset, deleteAsset, createFolder, deleteFolder }),
    [assets, folders, addAssets, renameAsset, moveAsset, deleteAsset, createFolder, deleteFolder]
  );

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}

export function useMedia() {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error("useMedia must be used within MediaProvider");
  return ctx;
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AdminMediaAsset, AdminMediaFolder } from "../types/media";
import { INITIAL_MEDIA_ASSETS, INITIAL_MEDIA_FOLDERS } from "../data/mediaData";
import {
  assetFromSupabaseRow,
  assetToSupabaseRow,
  folderFromSupabaseRow,
  folderToSupabaseRow,
  mediaAssetsRepository,
  mediaFoldersRepository,
} from "./mediaRepository.ts";

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

/**
 * CMS Phase 6B — Media, backed by the Supabase `media_assets`/
 * `media_folders` tables via the same generic repository engine
 * Categories and Books already proved out. Uploads are still mock object
 * URLs (`URL.createObjectURL`), byte-for-byte unchanged from before this
 * migration — only the *metadata record* now persists to Supabase. Real
 * uploads through actual Storage are an explicitly separate, later phase.
 *
 * The one-time LEGACY_OFFICIAL_URLS reconciliation this file used to run
 * on mount is gone, on purpose, not just unused: it existed to heal an
 * already-persisted *browser's* stale data from before a rebrand. Now
 * that Supabase is the source of truth, seeded once via
 * generate-media-seed.mjs from the already-correct INITIAL_MEDIA_ASSETS,
 * there is no stale local copy left to heal.
 */
export function MediaProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<AdminMediaAsset[]>(INITIAL_MEDIA_ASSETS);
  const [folders, setFolders] = useState<AdminMediaFolder[]>(INITIAL_MEDIA_FOLDERS);

  useEffect(() => {
    let cancelled = false;
    Promise.all([mediaFoldersRepository.list(), mediaAssetsRepository.list()])
      .then(([folderRows, assetRows]) => {
        if (cancelled) return;
        setFolders(folderRows.map(folderFromSupabaseRow));
        setAssets(assetRows.map(assetFromSupabaseRow));
      })
      .catch((error) => {
        console.error("Failed to load media from Supabase:", error);
      });
    return () => {
      cancelled = true;
    };
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
    void Promise.all(newAssets.map((asset) => mediaAssetsRepository.create(assetToSupabaseRow(asset)))).then(() => {
      setAssets((prev) => [...newAssets, ...prev]);
    });
  }, []);

  const renameAsset = useCallback((id: string, name: string) => {
    void mediaAssetsRepository.update(id, { name }).then(() => {
      setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, name } : a)));
    });
  }, []);

  const moveAsset = useCallback((id: string, folderId: string | null) => {
    void mediaAssetsRepository.update(id, { folder_id: folderId }).then(() => {
      setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, folderId } : a)));
    });
  }, []);

  const deleteAsset = useCallback((id: string) => {
    void mediaAssetsRepository.remove(id).then(() => {
      setAssets((prev) => prev.filter((a) => a.id !== id));
    });
  }, []);

  const createFolder = useCallback((name: string) => {
    setFolders((prevLocal) => {
      let id = `folder-${slugify(name)}`;
      let n = 2;
      while (prevLocal.some((f) => f.id === id)) {
        id = `folder-${slugify(name)}-${n}`;
        n += 1;
      }
      const folder: AdminMediaFolder = { id, name };
      void mediaFoldersRepository.create(folderToSupabaseRow(folder)).then(() => {
        setFolders((prev) => [...prev, folder]);
      });
      return prevLocal;
    });
  }, []);

  const deleteFolder = useCallback((id: string) => {
    // The real foreign key (media_assets.folder_id -> media_folders.id)
    // is ON DELETE SET NULL, so the database already does this same
    // cascade on its own; this mirrors it client-side so local state
    // matches what Supabase just did, without a second round-trip to
    // re-fetch assets.
    void mediaFoldersRepository.remove(id).then(() => {
      setFolders((prev) => prev.filter((f) => f.id !== id));
      setAssets((prev) => prev.map((a) => (a.folderId === id ? { ...a, folderId: null } : a)));
    });
  }, []);

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

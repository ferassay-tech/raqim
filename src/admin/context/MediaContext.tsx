import { createContext, useCallback, useContext, useMemo } from "react";
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

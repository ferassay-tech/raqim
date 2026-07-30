import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { LibraryFile, LibraryFileFormat } from "../types/library";
import { INITIAL_LIBRARY_FILES } from "../data/libraryData";
import { usePersistedState } from "../lib/usePersistedState";
import { getStorageAdapter } from "../services/storage";
import { useSettings } from "./SettingsContext";

interface LibraryContextValue {
  files: LibraryFile[];
  getFile: (id: string) => LibraryFile | undefined;
  getFilesForBook: (bookId: string) => LibraryFile[];
  uploadFile: (file: File, bookId: string | null, version?: string | null) => Promise<LibraryFile>;
  replaceFile: (id: string, file: File) => Promise<void>;
  renameFile: (id: string, filename: string) => void;
  setFileVersion: (id: string, version: string | null) => void;
  deleteFile: (id: string) => void;
  attachToBook: (id: string, bookId: string) => void;
  detachFromBook: (id: string) => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

const today = () => new Date().toISOString().slice(0, 10);

const EXTENSION_FORMAT: Record<string, LibraryFileFormat> = {
  pdf: "pdf",
  epub: "epub",
  mobi: "mobi",
  zip: "zip",
};

function formatFromFilename(name: string): LibraryFileFormat | null {
  const ext = name.split(".").pop()?.toLowerCase();
  return ext ? EXTENSION_FORMAT[ext] ?? null : null;
}

/**
 * The Digital Library — every downloadable file Raqim sells (PDF/EPUB/
 * MOBI/ZIP), independent from MediaContext (public-site images) per the
 * module boundaries in the plan. Uploads go through the active
 * StorageAdapter (services/storage) rather than handling object URLs
 * directly, so swapping "local" for a real provider later only means
 * changing which adapter Settings → Storage has selected.
 */
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = usePersistedState<LibraryFile[]>("library_files", INITIAL_LIBRARY_FILES);
  const { settings } = useSettings();
  const activeProvider = settings.storage.activeProvider;

  const getFile = useCallback((id: string) => files.find((f) => f.id === id), [files]);

  const getFilesForBook = useCallback(
    (bookId: string) =>
      files
        .filter((f) => f.bookId === bookId)
        .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
    [files]
  );

  const uploadFile = useCallback(
    async (file: File, bookId: string | null, version: string | null = null) => {
      const format = formatFromFilename(file.name);
      if (!format) throw new Error("صيغة الملف غير مدعومة. الصيغ المدعومة: PDF, EPUB, MOBI, ZIP.");

      const adapter = getStorageAdapter(activeProvider);
      const { storageKey, url } = await adapter.upload(file, `library/${Date.now()}-${file.name}`);

      const record: LibraryFile = {
        id: `lib-${Date.now()}`,
        filename: file.name,
        format,
        size: file.size,
        uploadedAt: today(),
        updatedAt: today(),
        storageProvider: activeProvider,
        storageKey,
        previewUrl: activeProvider === "local" ? url : null,
        bookId,
        version,
      };
      setFiles((prev) => [record, ...prev]);
      return record;
    },
    [activeProvider, setFiles]
  );

  const replaceFile = useCallback(
    async (id: string, file: File) => {
      const adapter = getStorageAdapter(activeProvider);
      const { storageKey, url } = await adapter.upload(file, `library/${Date.now()}-${file.name}`);
      const format = formatFromFilename(file.name);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                filename: file.name,
                format: format ?? f.format,
                size: file.size,
                storageProvider: activeProvider,
                storageKey,
                previewUrl: activeProvider === "local" ? url : null,
                updatedAt: today(),
              }
            : f
        )
      );
    },
    [activeProvider, setFiles]
  );

  const renameFile = useCallback((id: string, filename: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, filename, updatedAt: today() } : f)));
  }, [setFiles]);

  const setFileVersion = useCallback((id: string, version: string | null) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, version, updatedAt: today() } : f)));
  }, [setFiles]);

  const deleteFile = useCallback((id: string) => {
    const file = files.find((f) => f.id === id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (!file) return;
    // Best-effort remote cleanup — resolved by the file's own recorded
    // provider (not necessarily the currently active one), so an old file
    // uploaded under a different provider still gets cleaned up correctly.
    // The Admin's own record is removed regardless of this outcome; a
    // failed remote delete leaves an orphaned object behind rather than
    // blocking the Admin's delete action on a network hiccup.
    getStorageAdapter(file.storageProvider)
      .delete(file.storageKey)
      .catch(() => {
        /* orphaned remote object — same honest limitation as any other
         * best-effort cleanup; nothing further to do client-side */
      });
  }, [files, setFiles]);

  const attachToBook = useCallback((id: string, bookId: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, bookId, updatedAt: today() } : f)));
  }, [setFiles]);

  const detachFromBook = useCallback((id: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, bookId: null, updatedAt: today() } : f)));
  }, [setFiles]);

  const value = useMemo(
    () => ({
      files,
      getFile,
      getFilesForBook,
      uploadFile,
      replaceFile,
      renameFile,
      setFileVersion,
      deleteFile,
      attachToBook,
      detachFromBook,
    }),
    [files, getFile, getFilesForBook, uploadFile, replaceFile, renameFile, setFileVersion, deleteFile, attachToBook, detachFromBook]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}

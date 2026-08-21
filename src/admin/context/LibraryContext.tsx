import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LibraryFile, LibraryFileFormat } from "../types/library";
import { INITIAL_LIBRARY_FILES } from "../data/libraryData";
import { getStorageAdapter } from "../services/storage";
import { fileFromSupabaseRow, fileToSupabaseRow, libraryFilesRepository } from "./libraryRepository.ts";
import { useSettings } from "./SettingsContext";

interface LibraryContextValue {
  files: LibraryFile[];
  getFile: (id: string) => LibraryFile | undefined;
  getFilesForBook: (bookId: string) => LibraryFile[];
  uploadFile: (file: File, bookId: string | null, version?: string | null) => Promise<LibraryFile>;
  replaceFile: (id: string, file: File) => Promise<void>;
  renameFile: (id: string, filename: string) => void;
  setFileVersion: (id: string, version: string | null) => void;
  deleteFile: (id: string) => Promise<void>;
  attachToBook: (id: string, bookId: string) => void;
  detachFromBook: (id: string) => void;
  loadError: string | null;
  reload: () => void;
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
 *
 * The metadata record (this context's state) is backed by the
 * `library_files` Supabase table since Phase 6B; the upload/delete byte
 * mechanism through StorageAdapter is unchanged.
 */
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<LibraryFile[]>(INITIAL_LIBRARY_FILES);
  const { settings } = useSettings();
  const activeProvider = settings.storage.activeProvider;
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    libraryFilesRepository
      .list()
      .then((rows) => {
        if (cancelled) return;
        setFiles(rows.map(fileFromSupabaseRow));
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load library files from Supabase:", error);
        setLoadError("تعذر تحميل ملفات المكتبة من الخادم.");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

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
      await libraryFilesRepository.create(fileToSupabaseRow(record));
      setFiles((prev) => [record, ...prev]);
      return record;
    },
    [activeProvider]
  );

  const replaceFile = useCallback(
    async (id: string, file: File) => {
      const current = files.find((f) => f.id === id);
      if (!current) return;
      const adapter = getStorageAdapter(activeProvider);
      const { storageKey, url } = await adapter.upload(file, `library/${Date.now()}-${file.name}`);
      const format = formatFromFilename(file.name);
      const updated: LibraryFile = {
        ...current,
        filename: file.name,
        format: format ?? current.format,
        size: file.size,
        storageProvider: activeProvider,
        storageKey,
        previewUrl: activeProvider === "local" ? url : null,
        updatedAt: today(),
      };
      await libraryFilesRepository.update(id, fileToSupabaseRow(updated));
      setFiles((prev) => prev.map((f) => (f.id === id ? updated : f)));
    },
    [activeProvider, files]
  );

  const renameFile = useCallback((id: string, filename: string) => {
    void libraryFilesRepository
      .update(id, { filename, updated_at: new Date().toISOString() })
      .then(() => {
        setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, filename, updatedAt: today() } : f)));
      })
      .catch((error) => {
        console.error("Failed to rename library file:", error);
      });
  }, []);

  const setFileVersion = useCallback((id: string, version: string | null) => {
    void libraryFilesRepository
      .update(id, { version, updated_at: new Date().toISOString() })
      .then(() => {
        setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, version, updatedAt: today() } : f)));
      })
      .catch((error) => {
        console.error("Failed to update library file version:", error);
      });
  }, []);

  const deleteFile = useCallback(
    async (id: string) => {
      const file = files.find((f) => f.id === id);
      if (!file) return;
      await libraryFilesRepository.remove(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      // Best-effort remote cleanup — resolved by the file's own recorded
      // provider (not necessarily the currently active one), so an old
      // file uploaded under a different provider still gets cleaned up
      // correctly. The Admin's own record is already removed regardless
      // of this outcome; a failed remote delete leaves an orphaned
      // object behind rather than blocking the Admin's delete action on
      // a network hiccup.
      getStorageAdapter(file.storageProvider)
        .delete(file.storageKey)
        .catch(() => {
          /* orphaned remote object — same honest limitation as any
           * other best-effort cleanup; nothing further to do
           * client-side */
        });
    },
    [files]
  );

  const attachToBook = useCallback((id: string, bookId: string) => {
    void libraryFilesRepository
      .update(id, { book_id: bookId, updated_at: new Date().toISOString() })
      .then(() => {
        setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, bookId, updatedAt: today() } : f)));
      })
      .catch((error) => {
        console.error("Failed to attach library file to book:", error);
      });
  }, []);

  const detachFromBook = useCallback((id: string) => {
    void libraryFilesRepository
      .update(id, { book_id: null, updated_at: new Date().toISOString() })
      .then(() => {
        setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, bookId: null, updatedAt: today() } : f)));
      })
      .catch((error) => {
        console.error("Failed to detach library file from book:", error);
      });
  }, []);

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
      loadError,
      reload,
    }),
    [
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
      loadError,
      reload,
    ]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}

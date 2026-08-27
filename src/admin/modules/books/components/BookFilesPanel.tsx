import { useEffect, useRef, useState } from "react";
import { useLibrary } from "@/admin/context/LibraryContext";
import { formatBytes } from "@/admin/lib/formatBytes";
import { TextField } from "@/admin/components/forms/TextField";
import { Modal } from "@/admin/components/ui/Modal";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { LibraryFileDrawer } from "@/admin/modules/downloads/components/LibraryFileDrawer";
import { IconArchive, IconUpload } from "@/admin/icons";

/** One not-yet-uploaded file picked while the book itself doesn't have a
 * real id yet (create mode) — bytes are only sent to Storage/library_files
 * once the book has actually been saved, see BookNewPage. */
export interface StagedBookFile {
  /** Client-only, for React keys and removal — never a library_files id. */
  id: string;
  file: File;
  version: string | null;
}

/** Everything a create-mode Files tab is holding that still needs to be
 * turned into real library_files rows/relationships once the book exists. */
export interface PendingBookFiles {
  uploads: StagedBookFile[];
  /** Ids of already-existing, currently-unattached library_files rows the
   * admin chose to link — nothing is written until the book is saved. */
  linkIds: string[];
}

interface BookFilesPanelProps {
  /** The real book id in edit mode; null in create mode, before the book
   * has ever been saved. */
  bookId: string | null;
  /** Create mode only — called whenever the staged uploads/links change,
   * so the parent form can hand the current bundle to onSave. Never
   * called once bookId is real (edit mode manages files live instead). */
  onPendingFilesChange?: (pending: PendingBookFiles) => void;
}

function guessFormatLabel(filename: string): string {
  const ext = filename.split(".").pop()?.toUpperCase();
  return ext ?? "";
}

/**
 * Manages the downloadable files attached to one book — reads/writes
 * through LibraryContext (the same store the standalone Digital Library
 * page uses), so a file uploaded here shows up there and vice versa.
 * `AdminBook` itself is never touched — attachment lives entirely on
 * LibraryFile.bookId.
 *
 * In create mode (bookId === null) nothing is uploaded or linked yet —
 * new files are kept as plain in-memory File objects and existing files
 * are only remembered by id, both surfaced upward via onPendingFilesChange
 * so BookNewPage can turn them into the real library_files rows/links
 * once the book has actually been created and has a real id.
 */
export function BookFilesPanel({ bookId, onPendingFilesChange }: BookFilesPanelProps) {
  const { files, uploadFile, attachToBook, detachFromBook } = useLibrary();
  const attached = bookId
    ? files.filter((f) => f.bookId === bookId).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    : [];

  const [stagedUploads, setStagedUploads] = useState<StagedBookFile[]>([]);
  const [stagedLinkIds, setStagedLinkIds] = useState<string[]>([]);
  const stagedLinkFiles = stagedLinkIds
    .map((id) => files.find((f) => f.id === id))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  useEffect(() => {
    if (bookId === null) {
      onPendingFilesChange?.({ uploads: stagedUploads, linkIds: stagedLinkIds });
    }
  }, [bookId, stagedUploads, stagedLinkIds, onPendingFilesChange]);

  // Real, already-attached files (edit mode) are never offered again here;
  // in create mode, a file already staged to link is removed from the
  // pool too so it can't be picked twice.
  const unattached = files.filter((f) => f.bookId === null && !stagedLinkIds.includes(f.id));

  const [version, setVersion] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFile = activeFileId ? files.find((f) => f.id === activeFileId) ?? null : null;

  const handleUpload = async (file: File) => {
    setUploadError(null);
    try {
      await uploadFile(file, bookId, version.trim() || null);
      setVersion("");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "تعذّر رفع الملف.");
    }
  };

  const handleStageUpload = (file: File) => {
    setUploadError(null);
    setStagedUploads((prev) => [...prev, { id: `staged-${Date.now()}-${Math.random().toString(36).slice(2)}`, file, version: version.trim() || null }]);
    setVersion("");
  };

  const handleFileChosen = (file: File) => {
    if (bookId) void handleUpload(file);
    else handleStageUpload(file);
  };

  const removeStagedUpload = (id: string) => {
    setStagedUploads((prev) => prev.filter((s) => s.id !== id));
  };

  const stageLinkExisting = (fileId: string) => {
    setStagedLinkIds((prev) => (prev.includes(fileId) ? prev : [...prev, fileId]));
    setLinkModalOpen(false);
  };

  const unstageLinkExisting = (fileId: string) => {
    setStagedLinkIds((prev) => prev.filter((id) => id !== fileId));
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="rounded-md border border-beige bg-cream/40 p-5">
        <p className="text-sm text-ink">رفع ملف جديد</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <TextField
            label="رقم الإصدار (اختياري)"
            value={version}
            onChange={setVersion}
            placeholder="مثال: v1.0"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border border-gold px-4 py-2.5 text-sm font-medium text-gold-deep transition-colors hover:bg-gold/10"
          >
            <IconUpload className="h-4 w-4" />
            اختيار ملف
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.epub,.mobi,.zip"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileChosen(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => setLinkModalOpen(true)}
            className="text-sm text-ink-soft underline hover:text-ink"
          >
            أو ربط ملف مرفوع مسبقًا
          </button>
        </div>
        {uploadError && <p className="mt-2 text-xs text-danger">{uploadError}</p>}
        <p className="mt-2 text-xs text-ink-faint">PDF · EPUB · MOBI · ZIP — رفع نسخة جديدة كملف منفصل يحافظ على الإصدارات السابقة.</p>
      </div>

      {attached.length === 0 && stagedUploads.length === 0 && stagedLinkFiles.length === 0 ? (
        <EmptyState
          icon={IconArchive}
          title="لا توجد ملفات مرتبطة بهذا الكتاب بعد"
          description={
            bookId
              ? "ارفعي ملفًا أو اربطي ملفًا موجودًا من الأعلى."
              : "ارفعي ملفًا أو اختاري ملفًا موجودًا من الأعلى — سيُربط بالكتاب فور إضافته."
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {attached.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFileId(f.id)}
              className="flex items-center justify-between gap-3 rounded-md border border-beige bg-white/70 p-4 text-right transition-colors hover:border-gold"
            >
              <div>
                <p className="text-sm text-ink">
                  {f.filename}
                  {f.version && <span className="mr-2 text-xs text-gold-deep" dir="ltr">{f.version}</span>}
                </p>
                <p className="mt-1 text-xs text-ink-faint">
                  {f.format.toUpperCase()} · {formatBytes(f.size)} · رُفع في {f.uploadedAt}
                </p>
              </div>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  detachFromBook(f.id);
                }}
                className="text-xs text-ink-soft underline hover:text-danger"
              >
                فك الارتباط
              </span>
            </button>
          ))}

          {/* Create mode only: an existing library file selected to link —
              nothing is written until the book is actually saved (see
              PendingBookFiles), so "remove" here only drops it from this
              in-memory selection. */}
          {stagedLinkFiles.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between gap-3 rounded-md border border-beige border-dashed bg-white/70 p-4"
            >
              <div>
                <p className="text-sm text-ink">
                  {f.filename}
                  {f.version && <span className="mr-2 text-xs text-gold-deep" dir="ltr">{f.version}</span>}
                </p>
                <p className="mt-1 text-xs text-ink-faint">
                  {f.format.toUpperCase()} · {formatBytes(f.size)} · سيُربط عند إضافة الكتاب
                </p>
              </div>
              <button
                type="button"
                onClick={() => unstageLinkExisting(f.id)}
                className="text-xs text-ink-soft underline hover:text-danger"
              >
                إزالة
              </button>
            </div>
          ))}

          {/* Create mode only: a new file picked but not yet uploaded —
              bytes only leave the browser once the book has a real id
              (see BookNewPage). */}
          {stagedUploads.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-md border border-beige border-dashed bg-white/70 p-4"
            >
              <div>
                <p className="text-sm text-ink">
                  {s.file.name}
                  {s.version && <span className="mr-2 text-xs text-gold-deep" dir="ltr">{s.version}</span>}
                </p>
                <p className="mt-1 text-xs text-ink-faint">
                  {guessFormatLabel(s.file.name)} · {formatBytes(s.file.size)} · سيُرفع عند إضافة الكتاب
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeStagedUpload(s.id)}
                className="text-xs text-ink-soft underline hover:text-danger"
              >
                إزالة
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={linkModalOpen} onClose={() => setLinkModalOpen(false)} title="ربط ملف موجود">
        {unattached.length === 0 ? (
          <EmptyState icon={IconArchive} title="لا توجد ملفات غير مرتبطة" description="كل الملفات المرفوعة مرتبطة بكتب أخرى بالفعل." />
        ) : (
          <div className="flex flex-col gap-2">
            {unattached.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  if (bookId) {
                    attachToBook(f.id, bookId);
                    setLinkModalOpen(false);
                  } else {
                    stageLinkExisting(f.id);
                  }
                }}
                className="flex items-center justify-between gap-3 rounded-md border border-beige p-4 text-right transition-colors hover:border-gold"
              >
                <p className="text-sm text-ink">{f.filename}</p>
                <span className="text-xs text-ink-faint">{f.format.toUpperCase()} · {formatBytes(f.size)}</span>
              </button>
            ))}
          </div>
        )}
      </Modal>

      <LibraryFileDrawer file={activeFile} onClose={() => setActiveFileId(null)} />
    </div>
  );
}

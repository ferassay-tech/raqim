import { useRef, useState } from "react";
import { useLibrary } from "@/admin/context/LibraryContext";
import { formatBytes } from "@/admin/lib/formatBytes";
import { TextField } from "@/admin/components/forms/TextField";
import { Modal } from "@/admin/components/ui/Modal";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { LibraryFileDrawer } from "@/admin/modules/downloads/components/LibraryFileDrawer";
import { IconArchive, IconUpload } from "@/admin/icons";

interface BookFilesPanelProps {
  bookId: string;
}

/**
 * Manages the downloadable files attached to one book — reads/writes
 * through LibraryContext (the same store the standalone Digital Library
 * page uses), so a file uploaded here shows up there and vice versa.
 * `AdminBook` itself is never touched — attachment lives entirely on
 * LibraryFile.bookId.
 */
export function BookFilesPanel({ bookId }: BookFilesPanelProps) {
  const { files, uploadFile, attachToBook, detachFromBook } = useLibrary();
  const attached = files
    .filter((f) => f.bookId === bookId)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  const unattached = files.filter((f) => f.bookId === null);

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

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="rounded-[10px] border border-beige bg-cream/40 p-5">
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
              if (f) handleUpload(f);
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

      {attached.length === 0 ? (
        <EmptyState icon={IconArchive} title="لا توجد ملفات مرتبطة بهذا الكتاب بعد" description="ارفعي ملفًا أو اربطي ملفًا موجودًا من الأعلى." />
      ) : (
        <div className="flex flex-col gap-2">
          {attached.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFileId(f.id)}
              className="flex items-center justify-between gap-3 rounded-[10px] border border-beige bg-white/70 p-4 text-right transition-colors hover:border-gold"
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
                  attachToBook(f.id, bookId);
                  setLinkModalOpen(false);
                }}
                className="flex items-center justify-between gap-3 rounded-[10px] border border-beige p-4 text-right transition-colors hover:border-gold"
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

import { useEffect, useRef, useState } from "react";
import type { LibraryFile } from "@/admin/types/library";
import { formatBytes } from "@/admin/lib/formatBytes";
import { Drawer } from "@/admin/components/ui/Drawer";
import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { Select } from "@/admin/components/forms/Select";
import { TextField } from "@/admin/components/forms/TextField";
import { IconTrash, IconUpload } from "@/admin/icons";
import { useLibrary } from "@/admin/context/LibraryContext";
import { useBooks } from "@/admin/context/BooksContext";
import { useAuth } from "@/admin/context/AuthContext";
import { can } from "@/admin/lib/permissions";

interface LibraryFileDrawerProps {
  file: LibraryFile | null;
  onClose: () => void;
}

export function LibraryFileDrawer({ file, onClose }: LibraryFileDrawerProps) {
  const { renameFile, setFileVersion, replaceFile, deleteFile, attachToBook, detachFromBook } = useLibrary();
  const { books } = useBooks();
  const { currentUser } = useAuth();
  const canDelete = can(currentUser?.role, "deleteLibraryFile");

  const [name, setName] = useState(file?.filename ?? "");
  const [version, setVersionInput] = useState(file?.version ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(file?.filename ?? "");
    setVersionInput(file?.version ?? "");
  }, [file]);

  return (
    <Drawer open={Boolean(file)} onClose={onClose} title="تفاصيل الملف">
      {file && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3 rounded-[10px] bg-cream p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-gold-deep">{file.format}</p>
              <p className="mt-1 text-sm text-ink-faint">{formatBytes(file.size)}</p>
            </div>
            {file.previewUrl && (
              <a
                href={file.previewUrl}
                download={file.filename}
                className="rounded-full border border-gold px-4 py-2 text-xs font-medium text-gold-deep transition-colors hover:bg-gold/10"
              >
                تحميل
              </a>
            )}
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-ink">اسم الملف</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => name.trim() && name !== file.filename && renameFile(file.id, name.trim())}
              className="w-full rounded-[10px] border border-beige bg-ivory px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none"
            />
          </label>

          <div>
            <TextField
              label="رقم الإصدار (اختياري)"
              value={version}
              onChange={setVersionInput}
              placeholder="مثال: v1.0"
              hint="رفع نسخة جديدة كملف منفصل بدل استبدال هذا يحافظ على الإصدارات السابقة"
              dir="ltr"
            />
            {version !== (file.version ?? "") && (
              <button
                type="button"
                onClick={() => setFileVersion(file.id, version.trim() || null)}
                className="mt-2 text-xs text-gold-deep hover:underline"
              >
                حفظ رقم الإصدار
              </button>
            )}
          </div>

          <Select
            label="الكتاب المرتبط"
            value={file.bookId ?? "none"}
            onChange={(v) => (v === "none" ? detachFromBook(file.id) : attachToBook(file.id, v))}
            options={[{ value: "none", label: "غير مرتبط" }, ...books.map((b) => ({ value: b.id, label: b.title }))]}
          />

          <dl className="grid grid-cols-2 gap-4 rounded-[10px] border border-beige bg-cream/40 p-4 text-sm">
            <div>
              <dt className="text-xs text-ink-faint">تاريخ الرفع</dt>
              <dd className="mt-0.5 text-ink">{file.uploadedAt}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">آخر تحديث</dt>
              <dd className="mt-0.5 text-ink">{file.updatedAt}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => replaceInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-beige px-4 py-2.5 text-sm text-ink-soft transition-colors hover:border-gold hover:text-ink"
            >
              <IconUpload className="h-4 w-4" />
              استبدال الملف
            </button>
            <input
              ref={replaceInputRef}
              type="file"
              accept=".pdf,.epub,.mobi,.zip"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) replaceFile(file.id, f);
                e.target.value = "";
              }}
            />

            {canDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
              >
                <IconTrash className="h-4 w-4" />
                حذف الملف
              </button>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="حذف الملف"
        description={`هل تريدين حذف «${file?.filename ?? ""}»؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف نهائي"
        onConfirm={() => {
          if (file) deleteFile(file.id);
          setConfirmDelete(false);
          onClose();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </Drawer>
  );
}

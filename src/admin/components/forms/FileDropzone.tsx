import { useRef, useState } from "react";
import { IconTrash, IconUpload } from "@/admin/icons";

interface FileDropzoneProps {
  label: string;
  hint?: string;
  previewUrl: string | null;
  onFileSelected: (file: File) => void;
  onClear: () => void;
  /** When provided, offers "choose from the media library" alongside a
   * fresh upload — the same shared asset hub Books, Articles, and future
   * modules all read from (see src/admin/context/MediaContext.tsx). */
  onBrowseLibrary?: () => void;
}

/** Visual-only upload surface — no backend to send to yet, so a selected
 * file is previewed locally via an object URL and never leaves the browser. */
export function FileDropzone({ label, hint, previewUrl, onFileSelected, onClear, onBrowseLibrary }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file && file.type.startsWith("image/")) onFileSelected(file);
  };

  return (
    <div>
      <span className="mb-2 block text-sm text-ink">{label}</span>
      {previewUrl ? (
        <div className="flex items-center gap-4 rounded-[10px] border border-beige bg-ivory p-4">
          <div className="h-28 w-20 shrink-0 overflow-hidden rounded-md shadow-[0_10px_25px_-10px_rgba(44,36,32,0.4)]">
            <img src={previewUrl} alt="غلاف الكتاب" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-beige px-4 py-2 text-xs text-ink-soft transition-colors hover:border-gold hover:text-ink"
            >
              <IconUpload className="h-3.5 w-3.5" />
              استبدال الصورة
            </button>
            <button
              type="button"
              onClick={onClear}
              className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs text-danger transition-colors hover:bg-danger/10"
            >
              <IconTrash className="h-3.5 w-3.5" />
              إزالة
            </button>
            {onBrowseLibrary && (
              <button
                type="button"
                onClick={onBrowseLibrary}
                className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs text-gold-deep transition-colors hover:bg-gold/10"
              >
                اختيار من مكتبة الوسائط
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`flex w-full flex-col items-center gap-2.5 rounded-[10px] border border-dashed px-6 py-10 text-center transition-colors ${
            dragOver ? "border-gold bg-gold/5" : "border-beige bg-ivory hover:border-gold/60"
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-beige text-gold-deep">
            <IconUpload className="h-5 w-5" />
          </span>
          <span className="text-sm text-ink-soft">اسحبي الصورة هنا أو انقري للاختيار</span>
          {hint && <span className="text-xs text-ink-faint">{hint}</span>}
        </button>
      )}
      {!previewUrl && onBrowseLibrary && (
        <button
          type="button"
          onClick={onBrowseLibrary}
          className="mt-2 text-xs text-gold-deep transition-colors hover:text-gold"
        >
          أو اختيار من مكتبة الوسائط
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
}

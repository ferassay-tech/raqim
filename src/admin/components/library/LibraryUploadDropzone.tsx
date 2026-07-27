import { useRef, useState } from "react";
import { IconUpload } from "../../icons";

interface LibraryUploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

const ACCEPTED_EXTENSIONS = [".pdf", ".epub", ".mobi", ".zip"];

/** Same shape as MediaUploadDropzone, scoped to the downloadable formats
 * Raqim actually sells instead of images. Files land unattached and with
 * no version label — set both from the file's drawer right after, the
 * same "ingest first, refine after" flow the Media Library already uses. */
export function LibraryUploadDropzone({ onFilesSelected }: LibraryUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFilesSelected(Array.from(files));
  };

  return (
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
      className={`flex w-full flex-col items-center gap-3 rounded-[10px] border border-dashed px-6 py-10 text-center transition-colors ${
        dragOver ? "border-gold bg-gold/5" : "border-beige bg-white/50 hover:border-gold/60"
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-beige text-gold-deep">
        <IconUpload className="h-5 w-5" />
      </span>
      <span className="text-sm text-ink-soft">اسحبي الملف هنا أو انقري للرفع</span>
      <span className="text-xs text-ink-faint">PDF · EPUB · MOBI · ZIP</span>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </button>
  );
}

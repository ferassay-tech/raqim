import { useRef, useState } from "react";
import { IconUpload } from "@/admin/icons";

interface MediaUploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

/** Distinct from form/FileDropzone.tsx — that one manages a single field's
 * preview (a book's cover, say); this one just ingests any number of new
 * files into the shared library and gets out of the way. */
export function MediaUploadDropzone({ onFilesSelected }: MediaUploadDropzoneProps) {
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
      <span className="text-sm text-ink-soft">اسحبي الصور هنا أو انقري للرفع</span>
      <span className="text-xs text-ink-faint">يمكن رفع أكثر من صورة في المرة الواحدة</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </button>
  );
}

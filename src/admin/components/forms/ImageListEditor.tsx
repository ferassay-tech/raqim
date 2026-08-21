import { useState } from "react";
import { MediaPickerModal } from "@/admin/modules/media/components/MediaPickerModal";
import { IconPlus, IconTrash } from "@/admin/icons";

interface ImageListEditorProps {
  label: string;
  hint?: string;
  images: string[];
  onChange: (images: string[]) => void;
}

/** Multi-image list (gallery, flip-book preview pages) — adds only from the
 * shared Media Library, since a gallery is exactly where proper asset
 * management (naming, folders, reuse) matters most. */
export function ImageListEditor({ label, hint, images, onChange }: ImageListEditorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm text-ink">{label}</span>
        {hint && <span className="text-xs text-ink-faint">{hint}</span>}
      </div>
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={`${url}-${i}`} className="group relative h-24 w-16 shrink-0 overflow-hidden rounded-md border border-beige">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              aria-label="إزالة الصورة"
              className="absolute inset-0 grid place-items-center bg-ink/50 text-ivory opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ivory"
            >
              <IconTrash className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="grid h-24 w-16 shrink-0 place-items-center rounded-md border border-dashed border-beige text-ink-faint transition-colors hover:border-gold hover:text-gold-deep"
        >
          <IconPlus className="h-5 w-5" />
        </button>
      </div>

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => {
          onChange([...images, asset.url]);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

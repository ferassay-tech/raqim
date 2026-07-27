import { useMemo, useState } from "react";
import { useMedia } from "../../context/MediaContext";
import type { AdminMediaAsset } from "../../types/media";
import { Modal } from "../Modal";
import { SearchInput } from "../SearchInput";
import { FilterSelect } from "../FilterBar";
import { EmptyState } from "../EmptyState";
import { MediaAssetCard } from "./MediaAssetCard";
import { IconImage } from "../../icons";

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: AdminMediaAsset) => void;
}

/**
 * The reusable cross-feature selection flow — Books and Articles both open
 * this same modal from their cover-image field (via FileDropzone's
 * onBrowseLibrary) instead of each maintaining their own picker. Any future
 * module that needs an image just needs this one component.
 */
export function MediaPickerModal({ open, onClose, onSelect }: MediaPickerModalProps) {
  const { assets, folders } = useMedia();
  const [search, setSearch] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const matchesSearch = !search.trim() || a.name.includes(search);
      const matchesFolder = folderFilter === "all" || a.folderId === folderFilter;
      return matchesSearch && matchesFolder;
    });
  }, [assets, search, folderFilter]);

  return (
    <Modal open={open} onClose={onClose} title="اختيار من مكتبة الوسائط" size="lg">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="ابحثي عن ملف" className="w-full sm:w-64" />
          <FilterSelect
            ariaLabel="المجلد"
            value={folderFilter}
            onChange={setFolderFilter}
            options={[{ value: "all", label: "كل المجلدات" }, ...folders.map((f) => ({ value: f.id, label: f.name }))]}
          />
        </div>

        {assets.length === 0 ? (
          <EmptyState
            icon={IconImage}
            title="مكتبة الوسائط فارغة"
            description="ارفعي ملفات من صفحة مكتبة الوسائط أولًا لتتمكني من اختيارها هنا."
          />
        ) : filtered.length === 0 ? (
          <EmptyState icon={IconImage} title="لا توجد نتائج" description="جربي تعديل كلمات البحث أو المجلد المحدد." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((asset) => (
              <MediaAssetCard key={asset.id} asset={asset} onClick={() => onSelect(asset)} />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

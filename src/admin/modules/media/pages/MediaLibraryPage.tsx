import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMedia } from "@/admin/context/MediaContext";
import type { AdminMediaAsset } from "@/admin/types/media";
import { formatBytes } from "@/admin/lib/formatBytes";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import { SearchInput } from "@/admin/components/ui/SearchInput";
import { DataTable } from "@/admin/components/ui/DataTable";
import type { DataTableColumn } from "@/admin/components/ui/DataTable";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { Modal } from "@/admin/components/ui/Modal";
import { TextField } from "@/admin/components/forms/TextField";
import { MediaAssetCard } from "../components/MediaAssetCard";
import { MediaUploadDropzone } from "../components/MediaUploadDropzone";
import { MediaAssetDrawer } from "../components/MediaAssetDrawer";
import { IconGrid, IconImage, IconMenu, IconPlus, IconTrash } from "@/admin/icons";
import { findAssetUsage } from "@/admin/lib/findAssetUsage";
import { useBooks } from "@/admin/context/BooksContext";
import { useArticles } from "@/admin/context/ArticlesContext";
import { useSettings } from "@/admin/context/SettingsContext";

type ViewMode = "grid" | "list";

export default function MediaLibraryPage() {
  const { assets, folders, addAssets, renameAsset, moveAsset, deleteAsset, createFolder, deleteFolder } = useMedia();
  const { books } = useBooks();
  const { articles } = useArticles();
  const { settings } = useSettings();

  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [folderFilter, setFolderFilter] = useState<string>("all");
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const matchesSearch = !search.trim() || a.name.includes(search);
      const matchesFolder =
        folderFilter === "all" || (folderFilter === "none" ? a.folderId === null : a.folderId === folderFilter);
      return matchesSearch && matchesFolder;
    });
  }, [assets, search, folderFilter]);

  const activeAsset = activeAssetId ? assets.find((a) => a.id === activeAssetId) ?? null : null;
  const folderName = (id: string | null) => (id ? folders.find((f) => f.id === id)?.name ?? "—" : "غير مصنّف");

  const handleCreateFolder = (e: FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    createFolder(newFolderName.trim());
    setNewFolderName("");
    setFolderModalOpen(false);
  };

  const columns: DataTableColumn<AdminMediaAsset>[] = [
    {
      key: "name",
      header: "الملف",
      className: "min-w-[260px]",
      render: (a) => (
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-cream">
            <img src={a.url} alt={a.name} loading="lazy" className="h-full w-full object-cover" />
          </div>
          <span className="truncate text-ink">{a.name}</span>
        </div>
      ),
    },
    {
      key: "folder",
      header: "المجلد",
      render: (a) => <span className="text-ink-soft">{folderName(a.folderId)}</span>,
    },
    {
      key: "size",
      header: "الحجم",
      align: "end",
      render: (a) => <span className="text-ink-soft">{formatBytes(a.size)}</span>,
    },
    {
      key: "uploadedAt",
      header: "تاريخ الرفع",
      render: (a) => <span className="text-ink-soft">{a.uploadedAt}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (a) => {
        const inUse = findAssetUsage(a.url, { books, articles, settings }).length > 0;
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!inUse) deleteAsset(a.id);
            }}
            disabled={inUse}
            aria-label={inUse ? "الملف مستخدم حاليًا — افتحيه لعرض المواضع" : "حذف الملف"}
            title={inUse ? "الملف مستخدم حاليًا — افتحيه لعرض المواضع" : undefined}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-faint"
          >
            <IconTrash className="h-4 w-4" />
          </button>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader title="مكتبة الوسائط" description={`${assets.length.toLocaleString("en-US")} ملفًا`} />

      <MediaUploadDropzone onFilesSelected={(files) => addAssets(files, folderFilter === "all" || folderFilter === "none" ? null : folderFilter)} />

      <div className="flex flex-wrap items-center gap-2">
        <FolderPill
          label={`الكل (${assets.length})`}
          active={folderFilter === "all"}
          onClick={() => setFolderFilter("all")}
        />
        <FolderPill
          label={`غير مصنّف (${assets.filter((a) => a.folderId === null).length})`}
          active={folderFilter === "none"}
          onClick={() => setFolderFilter("none")}
        />
        {folders.map((folder) => (
          <FolderPill
            key={folder.id}
            label={`${folder.name} (${assets.filter((a) => a.folderId === folder.id).length})`}
            active={folderFilter === folder.id}
            onClick={() => setFolderFilter(folder.id)}
            onDelete={() => setDeleteFolderTarget(folder.id)}
          />
        ))}
        <button
          type="button"
          onClick={() => setFolderModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-beige px-4 py-2 text-xs text-ink-soft transition-colors hover:border-gold hover:text-ink"
        >
          <IconPlus className="h-3.5 w-3.5" />
          مجلد جديد
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="ابحثي عن ملف" className="w-full sm:w-72" />
        <div className="flex items-center gap-1 rounded-full border border-beige bg-white/70 p-1">
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-label="عرض شبكي"
            className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${
              view === "grid" ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream"
            }`}
          >
            <IconGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            aria-label="عرض قائمة"
            className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${
              view === "list" ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream"
            }`}
          >
            <IconMenu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {assets.length === 0 ? (
        <EmptyState
          icon={IconImage}
          title="لا توجد ملفات مرفوعة بعد"
          description="ابدئي برفع أول ملف عبر المربع أعلاه."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={IconImage}
          title="لا توجد نتائج"
          description="جربي تعديل البحث أو المجلد المحدد."
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {filtered.map((asset) => (
            <MediaAssetCard key={asset.id} asset={asset} onClick={() => setActiveAssetId(asset.id)} />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} rows={filtered} rowKey={(a) => a.id} onRowClick={(a) => setActiveAssetId(a.id)} />
      )}

      <MediaAssetDrawer
        asset={activeAsset}
        folders={folders}
        onClose={() => setActiveAssetId(null)}
        onRename={(name) => activeAsset && renameAsset(activeAsset.id, name)}
        onMove={(folderId) => activeAsset && moveAsset(activeAsset.id, folderId)}
        onDelete={() => {
          if (activeAsset) deleteAsset(activeAsset.id);
          setActiveAssetId(null);
        }}
      />

      <Modal open={folderModalOpen} onClose={() => setFolderModalOpen(false)} title="مجلد جديد">
        <form id="folder-form" onSubmit={handleCreateFolder}>
          <TextField label="اسم المجلد" value={newFolderName} onChange={setNewFolderName} required />
        </form>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setFolderModalOpen(false)}
            className="rounded-full px-5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-beige"
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="folder-form"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
          >
            إنشاء المجلد
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteFolderTarget)}
        title="حذف المجلد"
        description="سيتم حذف المجلد، وستنتقل ملفاته إلى «غير مصنّف» دون حذفها."
        confirmLabel="حذف المجلد"
        tone="danger"
        onConfirm={() => {
          if (deleteFolderTarget) {
            deleteFolder(deleteFolderTarget);
            if (folderFilter === deleteFolderTarget) setFolderFilter("all");
          }
          setDeleteFolderTarget(null);
        }}
        onCancel={() => setDeleteFolderTarget(null)}
      />
    </div>
  );
}

function FolderPill({
  label,
  active,
  onClick,
  onDelete,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  onDelete?: () => void;
}) {
  return (
    <span
      className={`group inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs transition-colors ${
        active ? "border-ink bg-ink text-ivory" : "border-beige bg-white/70 text-ink-soft hover:border-gold/50 hover:text-ink"
      }`}
    >
      <button type="button" onClick={onClick}>
        {label}
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="حذف المجلد"
          className={`grid h-4 w-4 place-items-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 ${
            active ? "hover:bg-white/20" : "hover:bg-danger/10 hover:text-danger"
          }`}
        >
          <IconTrash className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
}

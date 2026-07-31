import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { AdminMediaAsset, AdminMediaFolder } from "@/admin/types/media";
import { formatBytes } from "@/admin/lib/formatBytes";
import { Drawer } from "@/admin/components/ui/Drawer";
import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { CopyIconButton } from "@/admin/components/ui/CopyIconButton";
import { Select } from "@/admin/components/forms/Select";
import { IconTrash } from "@/admin/icons";
import { findAssetUsage } from "@/admin/lib/findAssetUsage";
import { useBooks } from "@/admin/context/BooksContext";
import { useArticles } from "@/admin/context/ArticlesContext";
import { useSettings } from "@/admin/context/SettingsContext";

interface MediaAssetDrawerProps {
  asset: AdminMediaAsset | null;
  folders: AdminMediaFolder[];
  onClose: () => void;
  onRename: (name: string) => void;
  onMove: (folderId: string | null) => void;
  onDelete: () => void;
}

export function MediaAssetDrawer({ asset, folders, onClose, onRename, onMove, onDelete }: MediaAssetDrawerProps) {
  const [name, setName] = useState(asset?.name ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { books } = useBooks();
  const { articles } = useArticles();
  const { settings } = useSettings();

  const usage = useMemo(
    () => (asset ? findAssetUsage(asset.url, { books, articles, settings }) : []),
    [asset, books, articles, settings]
  );

  useEffect(() => {
    setName(asset?.name ?? "");
  }, [asset]);

  return (
    <Drawer open={Boolean(asset)} onClose={onClose} title="تفاصيل الملف">
      {asset && (
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-[10px] bg-cream">
            <img src={asset.url} alt={asset.name} className="max-h-72 w-full object-contain" />
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-ink">اسم الملف</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => name.trim() && name !== asset.name && onRename(name.trim())}
              className="w-full rounded-[10px] border border-beige bg-ivory px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none"
            />
          </label>

          <Select
            label="المجلد"
            value={asset.folderId ?? "none"}
            onChange={(v) => onMove(v === "none" ? null : v)}
            options={[{ value: "none", label: "غير مصنّف" }, ...folders.map((f) => ({ value: f.id, label: f.name }))]}
          />

          <dl className="grid grid-cols-2 gap-4 rounded-[10px] border border-beige bg-cream/40 p-4 text-sm">
            <div>
              <dt className="text-xs text-ink-faint">الأبعاد</dt>
              <dd className="mt-0.5 text-ink">{asset.width && asset.height ? `${asset.width} × ${asset.height}` : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">الحجم</dt>
              <dd className="mt-0.5 text-ink">{formatBytes(asset.size)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">تاريخ الرفع</dt>
              <dd className="mt-0.5 text-ink">{asset.uploadedAt}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">الرابط</dt>
              <dd className="mt-0.5 flex items-center gap-1 text-ink">
                <span className="truncate" dir="ltr">
                  {asset.url}
                </span>
                <CopyIconButton value={asset.url} label="نسخ الرابط" className="h-6 w-6 shrink-0" />
              </dd>
            </div>
          </dl>

          {usage.length > 0 && (
            <div className="rounded-[10px] border border-warning/30 bg-warning/10 p-4">
              <p className="text-sm text-ink">مستخدم في {usage.length} موضع{usage.length > 1 ? "ًا" : ""}:</p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {usage.map((ref, i) => (
                  <li key={i}>
                    <Link
                      to={ref.to}
                      onClick={onClose}
                      className="text-sm text-gold-deep underline transition-colors hover:text-gold"
                    >
                      {ref.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-ink-faint">
                لا يمكن حذف الملف حتى تتم إزالته من هذه المواضع أولًا.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={usage.length > 0}
            className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:text-ink-faint disabled:hover:bg-transparent"
          >
            <IconTrash className="h-4 w-4" />
            حذف الملف
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="حذف الملف"
        description={`هل تريدين حذف «${asset?.name ?? ""}»؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف نهائي"
        onConfirm={() => {
          setConfirmDelete(false);
          onDelete();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </Drawer>
  );
}

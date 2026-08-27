import { useEffect, useState } from "react";
import type { AdminOrder } from "@/admin/types/order";
import {
  getOrderAttachments,
  getOrderAttachmentSignedUrl,
} from "@/admin/context/orderAttachmentsRepository";
import type { OrderAttachment } from "@/admin/context/orderAttachmentsRepository";
import { formatBytes } from "@/admin/lib/formatBytes";
import { IconAlertTriangle, IconArchive, IconDocument, IconEye } from "@/admin/icons";

interface OrderAttachmentsCardProps {
  order: AdminOrder;
}

type CardState = "loading" | "loaded" | "error";

function isImage(mimeType: string) {
  return mimeType.startsWith("image/");
}

function formatUploadedAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });
}

/**
 * "مرفقات العميل" — the file/receipt a customer attached at checkout
 * (order_attachments, private order-attachments bucket). Reachable only
 * because this whole page already requires orders.view (see routes.tsx);
 * the actual enforcement is order_attachments_select_admin's own RLS
 * check of the same permission, not this component. Every preview/
 * download link is a signed URL minted on demand — never a stored public
 * URL — matching supabaseAdapter.ts's existing short-TTL trust model.
 */
export function OrderAttachmentsCard({ order }: OrderAttachmentsCardProps) {
  const [state, setState] = useState<CardState>("loading");
  const [attachments, setAttachments] = useState<OrderAttachment[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    setActionError(null);
    getOrderAttachments(order.id)
      .then((rows) => {
        if (cancelled) return;
        setAttachments(rows);
        setState("loaded");
        // Thumbnails are shown immediately (not on click), so images alone
        // get a signed URL fetched eagerly here — PDFs stay a static file
        // card until "فتح الملف" is actually clicked.
        rows
          .filter((a) => isImage(a.mimeType))
          .forEach((a) => {
            getOrderAttachmentSignedUrl(a.storagePath)
              .then((url) => {
                if (cancelled) return;
                setThumbnails((prev) => ({ ...prev, [a.id]: url }));
              })
              .catch(() => {
                /* thumbnail is a convenience preview only — a failed fetch
                 * just falls back to the generic file icon below */
              });
          });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load order attachments:", error);
        setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [order.id]);

  const handleView = async (attachment: OrderAttachment) => {
    setActionError(null);
    setPendingAction(`view-${attachment.id}`);
    try {
      const url = await getOrderAttachmentSignedUrl(attachment.storagePath);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open order attachment:", error);
      setActionError("تعذر فتح الملف. حاولي مرة أخرى.");
    } finally {
      setPendingAction(null);
    }
  };

  const handleDownload = async (attachment: OrderAttachment) => {
    setActionError(null);
    setPendingAction(`download-${attachment.id}`);
    try {
      const url = await getOrderAttachmentSignedUrl(attachment.storagePath);
      const response = await fetch(url);
      if (!response.ok) throw new Error("attachment-unavailable");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = attachment.originalFilename;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Failed to download order attachment:", error);
      setActionError("تعذر تنزيل الملف. حاولي مرة أخرى.");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="rounded-md border border-beige bg-white/70 p-6 shadow-(--shadow-soft) backdrop-blur">
      <h2 className="font-display text-h2 text-ink">مرفقات العميل</h2>

      {state === "loading" && <p className="mt-3 text-sm text-ink-faint">جارٍ التحميل...</p>}

      {state === "error" && (
        <p className="mt-3 flex items-center gap-2 text-sm text-danger">
          <IconAlertTriangle className="h-4 w-4 shrink-0" />
          تعذر تحميل مرفقات هذا الطلب.
        </p>
      )}

      {state === "loaded" && attachments.length === 0 && (
        <p className="mt-3 text-sm text-ink-faint">لا توجد مرفقات لهذا الطلب.</p>
      )}

      {state === "loaded" && attachments.length > 0 && (
        <ul className="mt-4 flex flex-col gap-3">
          {attachments.map((attachment) => {
            const image = isImage(attachment.mimeType);
            const thumbnailUrl = thumbnails[attachment.id];
            const isViewing = pendingAction === `view-${attachment.id}`;
            const isDownloading = pendingAction === `download-${attachment.id}`;
            return (
              <li
                key={attachment.id}
                className="flex items-center gap-3 rounded-md border border-beige bg-cream/40 p-3"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-white">
                  {image && thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={attachment.originalFilename}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <IconDocument className="h-5 w-5 text-ink-faint" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{attachment.originalFilename}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {attachment.mimeType} · {formatBytes(attachment.sizeBytes)} · {formatUploadedAt(attachment.uploadedAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleView(attachment)}
                    disabled={isViewing}
                    aria-label={image ? "عرض" : "فتح الملف"}
                    title={image ? "عرض" : "فتح الملف"}
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-cream hover:text-ink disabled:cursor-wait disabled:opacity-60"
                  >
                    <IconEye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(attachment)}
                    disabled={isDownloading}
                    aria-label="تنزيل"
                    title="تنزيل"
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-cream hover:text-ink disabled:cursor-wait disabled:opacity-60"
                  >
                    <IconArchive className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {actionError && <p className="mt-3 text-xs text-danger">{actionError}</p>}
    </div>
  );
}

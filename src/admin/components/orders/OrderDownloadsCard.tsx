import { useMemo, useState } from "react";
import type { AdminOrder } from "../../types/order";
import { useDownloads } from "../../context/DownloadsContext";
import { useLibrary } from "../../context/LibraryContext";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../lib/permissions";
import { getEmailProvider } from "../../services/email";
import { CopyIconButton } from "../CopyIconButton";
import { ConfirmDialog } from "../ConfirmDialog";
import { IconArchive, IconMail, IconRefresh } from "../../icons";

interface OrderDownloadsCardProps {
  order: AdminOrder;
}

/**
 * Only Confirmed ("paid") orders unlock download generation — the concrete
 * form of Part 7's "Only Confirmed orders should unlock download
 * generation." A future real payment provider plugs into this the moment
 * it calls setOrderStatus(id, "paid"); nothing else here changes.
 */
export function OrderDownloadsCard({ order }: OrderDownloadsCardProps) {
  const { getTokensForOrder, generateToken, regenerateToken, disableToken } = useDownloads();
  const { getFilesForBook } = useLibrary();
  const { currentUser } = useAuth();
  const canManage = can(currentUser?.role, "manageDownloads");

  const [confirmDisable, setConfirmDisable] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  const linkedFiles = useMemo(() => {
    const seen = new Set<string>();
    const files = [];
    for (const item of order.items) {
      for (const file of getFilesForBook(item.bookId)) {
        if (seen.has(file.id)) continue;
        seen.add(file.id);
        files.push(file);
      }
    }
    return files;
  }, [order.items, getFilesForBook]);

  const tokens = getTokensForOrder(order.id);
  const activeToken = tokens.find((t) => !t.disabled) ?? null;
  const downloadUrl = activeToken ? `${window.location.origin}/download/${activeToken.id}` : null;

  const handleGenerate = () => {
    generateToken(order.id, linkedFiles.map((f) => f.id));
  };

  const handleSendEmail = async () => {
    if (!downloadUrl) return;
    setEmailNotice(null);
    try {
      await getEmailProvider("resend").sendDownloadEmail({
        to: order.customerEmail,
        orderId: order.id,
        downloadUrl,
      });
    } catch (err) {
      setEmailNotice(err instanceof Error ? err.message : "تعذّر إرسال البريد الإلكتروني.");
    }
  };

  return (
    <div className="rounded-[10px] border border-beige bg-white/70 p-6 shadow-(--shadow-soft) backdrop-blur">
      <h2 className="font-display text-lg text-ink">التحميلات</h2>

      {linkedFiles.length === 0 ? (
        <p className="mt-3 text-sm text-ink-faint">لا توجد ملفات مرتبطة بكتب هذا الطلب بعد.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-1.5 text-sm text-ink-soft">
          {linkedFiles.map((f) => (
            <li key={f.id} className="flex items-center gap-2">
              <IconArchive className="h-3.5 w-3.5 shrink-0 text-gold" />
              {f.filename}
              {f.version && <span dir="ltr" className="text-xs text-gold-deep">{f.version}</span>}
            </li>
          ))}
        </ul>
      )}

      {order.status !== "paid" ? (
        <p className="mt-4 rounded-[10px] bg-cream/60 p-3 text-xs text-ink-faint">
          التحميلات تُتاح فقط بعد تأكيد الدفع وتحديد الطلب كـ«مدفوع».
        </p>
      ) : !canManage ? (
        <p className="mt-4 text-xs text-ink-faint">صلاحيتك الحالية لا تسمح بإدارة روابط التحميل.</p>
      ) : linkedFiles.length === 0 ? null : !activeToken ? (
        <button
          type="button"
          onClick={handleGenerate}
          className="mt-4 w-full rounded-full bg-ink py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
        >
          توليد رابط تحميل
        </button>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 rounded-[10px] bg-cream/60 px-4 py-3">
            <span className="truncate text-xs text-ink" dir="ltr">{downloadUrl}</span>
            <CopyIconButton value={downloadUrl ?? ""} label="نسخ الرابط" className="h-6 w-6 shrink-0" />
          </div>

          <dl className="grid grid-cols-2 gap-3 text-xs text-ink-soft">
            <div>
              <dt className="text-ink-faint">عدد مرات التحميل</dt>
              <dd className="mt-0.5 text-ink">{activeToken.downloadCount.toLocaleString("en-US")}</dd>
            </div>
            <div>
              <dt className="text-ink-faint">آخر تحميل</dt>
              <dd className="mt-0.5 text-ink">{activeToken.lastDownloadedAt ?? "لم يُحمَّل بعد"}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => regenerateToken(order.id)}
              className="inline-flex items-center gap-1.5 rounded-full border border-beige px-4 py-2 text-xs text-ink-soft transition-colors hover:border-gold hover:text-ink"
            >
              <IconRefresh className="h-3.5 w-3.5" />
              إعادة توليد الرابط
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              className="inline-flex items-center gap-1.5 rounded-full border border-beige px-4 py-2 text-xs text-ink-soft transition-colors hover:border-gold hover:text-ink"
            >
              <IconMail className="h-3.5 w-3.5" />
              إرسال عبر البريد الإلكتروني
            </button>
            <button
              type="button"
              onClick={() => setConfirmDisable(true)}
              className="rounded-full px-4 py-2 text-xs text-danger transition-colors hover:bg-danger/10"
            >
              تعطيل الرابط
            </button>
          </div>
          {emailNotice && <p className="text-xs text-ink-faint">{emailNotice}</p>}
        </div>
      )}

      <ConfirmDialog
        open={confirmDisable}
        title="تعطيل رابط التحميل"
        description="لن يتمكن العميل من استخدام هذا الرابط بعد تعطيله. يمكنك توليد رابط جديد لاحقًا."
        confirmLabel="تعطيل"
        onConfirm={() => {
          if (activeToken) disableToken(activeToken.id);
          setConfirmDisable(false);
        }}
        onCancel={() => setConfirmDisable(false)}
      />
    </div>
  );
}

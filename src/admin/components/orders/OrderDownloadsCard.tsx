import { useEffect, useMemo, useState } from "react";
import type { AdminOrder } from "../../types/order";
import { useDownloads } from "../../context/DownloadsContext";
import { useLibrary } from "../../context/LibraryContext";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../lib/permissions";
import { getEmailProvider } from "../../services/email";
import { CopyIconButton } from "../CopyIconButton";
import { ConfirmDialog } from "../ConfirmDialog";
import { Toast } from "../Toast";
import type { ToastState } from "../Toast";
import { IconArchive, IconMail, IconRefresh } from "../../icons";

interface OrderDownloadsCardProps {
  order: AdminOrder;
}

type EmailSendStatus = "idle" | "sending" | "sent" | "error";

/** UI-only, per-order "last email sent" memory — deliberately separate from
 * DownloadToken/AdminOrder (neither is touched here); this is purely a
 * display convenience, not part of the download/order data model. */
const LAST_EMAIL_SENT_KEY = "raqim_admin:last_email_sent";

function readLastEmailSentMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LAST_EMAIL_SENT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLastEmailSent(orderId: string, iso: string) {
  try {
    const map = readLastEmailSentMap();
    map[orderId] = iso;
    localStorage.setItem(LAST_EMAIL_SENT_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota/availability errors */
  }
}

/**
 * Only Confirmed ("paid") orders unlock download generation — the concrete
 * form of Part 7's "Only Confirmed orders should unlock download
 * generation." A future real payment provider plugs into this the moment
 * it calls setOrderStatus(id, "paid"); nothing else here changes.
 *
 * Token generation itself is automatic (see the effect below): the moment an
 * order is paid and has at least one linked library file, a token is minted
 * without the admin needing to click anything — "approve the order" IS "the
 * download link now exists." The manual button below only remains for the
 * case where files get attached to the book *after* the order was approved
 * (nothing to link yet at approval time), or to force a fresh link later.
 */
export function OrderDownloadsCard({ order }: OrderDownloadsCardProps) {
  const { getTokensForOrder, generateToken, regenerateToken, disableToken } = useDownloads();
  const { getFilesForBook } = useLibrary();
  const { currentUser } = useAuth();
  const canManage = can(currentUser?.role, "manageDownloads");

  const [confirmDisable, setConfirmDisable] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailSendStatus>("idle");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [lastEmailSentAt, setLastEmailSentAt] = useState<string | null>(null);

  useEffect(() => {
    setLastEmailSentAt(readLastEmailSentMap()[order.id] ?? null);
    setEmailStatus("idle");
  }, [order.id]);

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

  useEffect(() => {
    if (order.status === "paid" && canManage && linkedFiles.length > 0 && !activeToken) {
      generateToken(order.id, linkedFiles.map((f) => f.id));
    }
    // Deliberately reacts to the order's approval and to files becoming
    // available — not a one-time mount effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.status, order.id, linkedFiles, activeToken, canManage]);

  const handleGenerate = () => {
    generateToken(order.id, linkedFiles.map((f) => f.id));
  };

  const handleSendEmail = async () => {
    // Guards against both a stale mid-flight click and a genuine
    // double-click while the request is already pending.
    if (!downloadUrl || emailStatus === "sending") return;
    setEmailStatus("sending");
    const book = order.items[0];
    try {
      await getEmailProvider("resend").sendDownloadEmail({
        to: order.customerEmail,
        orderId: order.id,
        downloadUrl,
        bookTitle: book?.title,
        bookCoverUrl: book?.cover ?? null,
        maxDownloads: activeToken?.maxDownloads ?? null,
        expiresAt: activeToken?.expiresAt ?? null,
      });
      const now = new Date().toISOString();
      writeLastEmailSent(order.id, now);
      setLastEmailSentAt(now);
      setEmailStatus("sent");
      setToast({ variant: "success", message: "تم إرسال رابط التحميل إلى بريد العميل بنجاح." });
    } catch {
      setEmailStatus("error");
      setToast({ variant: "error", message: "تعذر إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى." });
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
              <dd className="mt-0.5 text-ink" dir="ltr">
                {activeToken.downloadCount.toLocaleString("en-US")}
                {activeToken.maxDownloads !== null && ` / ${activeToken.maxDownloads.toLocaleString("en-US")}`}
              </dd>
            </div>
            <div>
              <dt className="text-ink-faint">آخر تحميل</dt>
              <dd className="mt-0.5 text-ink">{activeToken.lastDownloadedAt ?? "لم يُحمَّل بعد"}</dd>
            </div>
            <div>
              <dt className="text-ink-faint">تنتهي الصلاحية</dt>
              <dd className="mt-0.5 text-ink" dir="ltr">
                {activeToken.expiresAt ? new Date(activeToken.expiresAt).toLocaleDateString("ar-EG") : "بلا انتهاء"}
              </dd>
            </div>
            <div>
              <dt className="text-ink-faint">الحد الأقصى للتحميلات</dt>
              <dd className="mt-0.5 text-ink" dir="ltr">{activeToken.maxDownloads ?? "بلا حد"}</dd>
            </div>
            <div>
              <dt className="text-ink-faint">آخر إرسال بريد</dt>
              <dd className="mt-0.5 text-ink">
                {lastEmailSentAt
                  ? new Date(lastEmailSentAt).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })
                  : "لم يُرسَل بعد"}
              </dd>
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
              disabled={emailStatus === "sending"}
              aria-busy={emailStatus === "sending"}
              className="inline-flex items-center gap-1.5 rounded-full border border-beige px-4 py-2 text-xs text-ink-soft transition-colors hover:border-gold hover:text-ink disabled:cursor-wait disabled:opacity-60 disabled:hover:border-beige disabled:hover:text-ink-soft"
            >
              {emailStatus === "sending" ? (
                <>
                  <span
                    aria-hidden
                    className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-ink-faint border-t-transparent"
                  />
                  جاري إرسال البريد...
                </>
              ) : lastEmailSentAt ? (
                <>
                  <IconRefresh className="h-3.5 w-3.5" />
                  إعادة إرسال
                </>
              ) : (
                <>
                  <IconMail className="h-3.5 w-3.5" />
                  إرسال عبر البريد الإلكتروني
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDisable(true)}
              className="rounded-full px-4 py-2 text-xs text-danger transition-colors hover:bg-danger/10"
            >
              تعطيل الرابط
            </button>
          </div>
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
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

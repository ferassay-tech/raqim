import { useEffect, useMemo, useRef, useState } from "react";
import type { AdminOrder } from "@/admin/types/order";
import { useDownloads } from "@/admin/context/DownloadsContext";
import { useLibrary } from "@/admin/context/LibraryContext";
import { useHasPermission } from "@/admin/lib/useHasPermission";
import { useCommunicationTemplates } from "@/admin/context/CommunicationTemplatesContext";
import { DOWNLOAD_EMAIL_TEMPLATE_ID } from "@/admin/data/communicationTemplatesData";
import { renderTemplateToHtml } from "@/admin/modules/communications/utils/renderTemplateToHtml";
import { getEmailProvider } from "@/admin/services/email";
import { CopyIconButton } from "@/admin/components/ui/CopyIconButton";
import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { Toast } from "@/admin/components/ui/Toast";
import type { ToastState } from "@/admin/components/ui/Toast";
import { IconArchive, IconMail, IconRefresh } from "@/admin/icons";

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
 * generation." Re-enforced server-side too (P0-1): the download_tokens
 * INSERT policy itself re-checks the order is 'paid', not just this effect.
 *
 * P0-1 — tokens are now Supabase-backed (download_tokens), and only a hash
 * of the raw token is ever stored. That means the raw, usable
 * /download/{token} URL exists ONLY in this component's own state, right
 * after generateToken()/regenerateToken() resolves — it cannot be recovered
 * from `activeToken` alone (which only carries admin-safe metadata: id,
 * expiry, download count, disabled). If this card remounts after a token
 * was already minted (e.g. a page refresh), `rawToken` is empty even though
 * a real, working token still exists server-side — the UI below says so
 * explicitly and offers "إعادة توليد الرابط" to mint a fresh, usable one.
 */
export function OrderDownloadsCard({ order }: OrderDownloadsCardProps) {
  const { getTokensForOrder, generateToken, regenerateToken, disableToken } = useDownloads();
  const { getFilesForBook } = useLibrary();
  const { resolveTemplateForSending } = useCommunicationTemplates();
  const hasPermission = useHasPermission();
  // Matches download_tokens' own RLS gate (has_permission('library.manage'),
  // see download_tokens_insert_editor_or_owner/_update_editor_or_owner) —
  // the legacy role-only can() check here previously ignored a per-user
  // permission override, so this control could stay enabled after an
  // owner revoked the capability from this specific admin, only to fail
  // silently at RLS.
  const canManage = hasPermission("library.manage");

  const [confirmDisable, setConfirmDisable] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailSendStatus>("idle");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [lastEmailSentAt, setLastEmailSentAt] = useState<string | null>(null);
  const [rawToken, setRawToken] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const mintingRef = useRef(false);

  useEffect(() => {
    setLastEmailSentAt(readLastEmailSentMap()[order.id] ?? null);
    setEmailStatus("idle");
    setRawToken(null);
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
  const downloadUrl = rawToken ? `${window.location.origin}/download/${rawToken}` : null;

  // Shared across the auto-mint effect below AND handleGenerate/
  // handleRegenerate — the confirmed duplicate-token race: regenerateToken()
  // disables the existing token(s) and updates local state before its own
  // mint() resolves, which makes activeToken briefly become null and
  // re-triggers this effect. Previously only the effect itself checked this
  // ref, so a manual regenerate/generate click was invisible to it and a
  // second, independent mint would start concurrently. Setting it before
  // and clearing it after every mint attempt — from all three call sites —
  // closes that gap.
  useEffect(() => {
    if (
      order.status === "paid" &&
      canManage &&
      linkedFiles.length > 0 &&
      !activeToken &&
      !mintingRef.current
    ) {
      mintingRef.current = true;
      generateToken(order.id, linkedFiles.map((f) => f.id))
        .then(({ rawToken: minted }) => setRawToken(minted))
        .catch((error) => {
          console.error("Failed to auto-generate download token:", error);
        })
        .finally(() => {
          mintingRef.current = false;
        });
    }
    // Deliberately reacts to the order's approval and to files becoming
    // available — not a one-time mount effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.status, order.id, linkedFiles, activeToken, canManage]);

  const handleGenerate = async () => {
    if (mintingRef.current) return;
    mintingRef.current = true;
    setIsMinting(true);
    try {
      const { rawToken: minted } = await generateToken(order.id, linkedFiles.map((f) => f.id));
      setRawToken(minted);
    } catch {
      setToast({ variant: "error", message: "تعذّر توليد رابط التحميل." });
    } finally {
      setIsMinting(false);
      mintingRef.current = false;
    }
  };

  const handleRegenerate = async () => {
    if (mintingRef.current) return;
    mintingRef.current = true;
    setIsMinting(true);
    try {
      const minted = await regenerateToken(order.id);
      if (minted) setRawToken(minted.rawToken);
    } catch {
      setToast({ variant: "error", message: "تعذّرت إعادة توليد رابط التحميل." });
    } finally {
      setIsMinting(false);
      mintingRef.current = false;
    }
  };

  const handleSendEmail = async () => {
    // Guards against both a stale mid-flight click and a genuine
    // double-click while the request is already pending.
    if (!downloadUrl || emailStatus === "sending") return;

    // The single template this flow sends — no picker, no resolver. Resolved
    // for sending always in Arabic, independent of whatever site language the
    // admin's own browser currently has active: there is no real
    // recipient-language signal yet (no order.customerLanguage or similar),
    // so email rendering must not depend on the admin's UI language. If the
    // template is missing (e.g. deleted), fail clearly rather than falling
    // back to any default content.
    const template = resolveTemplateForSending(DOWNLOAD_EMAIL_TEMPLATE_ID);
    if (!template) {
      setEmailStatus("error");
      setToast({ variant: "error", message: "تعذر إرسال البريد الإلكتروني: قالب رابط التحميل غير موجود." });
      return;
    }

    setEmailStatus("sending");
    const book = order.items[0];
    // The template's own Button section only ever holds placeholder content
    // authored in the editor — the real, per-order download link is the one
    // dynamic value this flow needs, applied directly here (not a variable
    // engine: a single, known field on a single, known section type).
    const sectionsWithRealLink = template.draft.map((section) =>
      section.type === "button" ? { ...section, fields: { ...section.fields, url: downloadUrl } } : section
    );
    const contentHtml = renderTemplateToHtml(sectionsWithRealLink);

    try {
      await getEmailProvider("resend").sendDownloadEmail({
        to: order.customerEmail,
        orderId: order.id,
        downloadUrl,
        contentHtml,
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
          disabled={isMinting}
          className="mt-4 w-full rounded-full bg-ink py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep disabled:cursor-wait disabled:opacity-60"
        >
          {isMinting ? "جارٍ التوليد..." : "توليد رابط تحميل"}
        </button>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {downloadUrl ? (
            <div className="flex items-center justify-between gap-2 rounded-[10px] bg-cream/60 px-4 py-3">
              <span className="truncate text-xs text-ink" dir="ltr">{downloadUrl}</span>
              <CopyIconButton value={downloadUrl} label="نسخ الرابط" className="h-6 w-6 shrink-0" />
            </div>
          ) : (
            <p className="rounded-[10px] bg-cream/60 p-3 text-xs text-ink-faint">
              يوجد رابط تحميل نشط لهذا الطلب، لكن لا يمكن استرجاع نصه في هذه الجلسة — استخدمي «إعادة توليد الرابط» أدناه
              للحصول على رابط جديد قابل للنسخ أو الإرسال.
            </p>
          )}

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
              onClick={handleRegenerate}
              disabled={isMinting}
              className="inline-flex items-center gap-1.5 rounded-full border border-beige px-4 py-2 text-xs text-ink-soft transition-colors hover:border-gold hover:text-ink disabled:cursor-wait disabled:opacity-60"
            >
              <IconRefresh className="h-3.5 w-3.5" />
              {isMinting ? "جارٍ التوليد..." : "إعادة توليد الرابط"}
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={!downloadUrl || emailStatus === "sending"}
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
          if (activeToken) {
            disableToken(activeToken.id).catch(() => {
              setToast({ variant: "error", message: "تعذّر تعطيل رابط التحميل." });
            });
          }
          setConfirmDisable(false);
        }}
        onCancel={() => setConfirmDisable(false)}
      />
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

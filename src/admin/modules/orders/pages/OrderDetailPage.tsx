import { Link, useNavigate, useParams } from "react-router-dom";
import { Reveal } from "@/components/motion-primitives";
import {
  useOrders,
  EMAIL_SENT_TIMELINE_LABEL,
  ADMIN_NOTIFICATION_SENT_TIMELINE_LABEL,
} from "@/admin/context/OrdersContext";
import { useDownloads } from "@/admin/context/DownloadsContext";
import { useLibrary } from "@/admin/context/LibraryContext";
import { useCommunicationTemplates } from "@/admin/context/CommunicationTemplatesContext";
import { DOWNLOAD_EMAIL_TEMPLATE_ID, ADMIN_PAYMENT_NOTIFICATION_TEMPLATE_ID } from "@/admin/data/communicationTemplatesData";
import { renderTemplateToHtml } from "@/admin/modules/communications/utils/renderTemplateToHtml";
import { getEmailProvider } from "@/admin/services/email";
import { ORDER_STATUS_META } from "@/admin/lib/orderStatus";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { OrderItemsCard } from "../components/OrderItemsCard";
import { OrderCustomerCard } from "../components/OrderCustomerCard";
import { OrderPaymentCard } from "../components/OrderPaymentCard";
import type { ConfirmPaymentFlowResult, AdminNotificationOutcome } from "../components/OrderPaymentCard";
import { OrderTimelineCard } from "../components/OrderTimelineCard";
import { OrderDownloadsCard } from "../components/OrderDownloadsCard";
import { OrderAttachmentsCard } from "../components/OrderAttachmentsCard";
import { IconBag, IconChevronStart } from "@/admin/icons";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrder, setOrderStatus, addNote, confirmPayment, recordEmailSent, recordAdminNotificationSent } =
    useOrders();
  const { getTokensForOrder, generateToken } = useDownloads();
  const { getFilesForBook } = useLibrary();
  const { resolveTemplateForSending } = useCommunicationTemplates();
  const order = id ? getOrder(id) : undefined;

  /**
   * Attempts the admin payment-confirmation notification — a completely
   * separate email operation from the customer download email above,
   * never merged with it. Always attempted once a real confirmation just
   * happened, regardless of how the customer-email step went (sent,
   * skipped, or failed) — the payment event itself is what's being
   * reported, not the email outcome. Failure here never affects the
   * customer-email result already computed by the caller; it's reported
   * back independently so OrderPaymentCard can show "...لكن تعذّر إرسال
   * إشعار الإدارة." without touching the customer-email message.
   * The real duplicate-send guard is the DB-level claim in
   * api/send-admin-payment-notification.ts (order_notification_claims);
   * the timeline check below is only a fast, human-readable UI-level
   * skip for the common refresh/reopen case.
   */
  const attemptAdminNotification = async (downloadEmailSent: boolean): Promise<AdminNotificationOutcome> => {
    if (!order) return { status: "failed", reason: "الطلب غير موجود." };
    if (order.timeline.some((event) => event.label === ADMIN_NOTIFICATION_SENT_TIMELINE_LABEL)) {
      return { status: "already-sent" };
    }

    const template = resolveTemplateForSending(ADMIN_PAYMENT_NOTIFICATION_TEMPLATE_ID);
    if (!template) {
      return { status: "failed", reason: "قالب إشعار الإدارة غير موجود." };
    }

    const orderUrl = `${window.location.origin}/admin/orders/${order.id}`;
    const sectionsWithRealLink = template.draft.map((section) =>
      section.type === "button" ? { ...section, fields: { ...section.fields, url: orderUrl } } : section
    );
    const contentHtml = renderTemplateToHtml(sectionsWithRealLink);

    try {
      const response = await fetch("/api/send-admin-payment-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, contentHtml, downloadEmailSent }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        return { status: "failed", reason: body?.error ?? "تعذّر إرسال إشعار الإدارة." };
      }
      if (body?.alreadySent) return { status: "already-sent" };
      if (body?.skippedNoRecipients) return { status: "skipped" };
      recordAdminNotificationSent(order.id);
      return { status: "sent" };
    } catch (error) {
      console.error("Failed to send admin payment notification:", error);
      return { status: "failed", reason: "تعذّر إرسال إشعار الإدارة." };
    }
  };

  /**
   * Orchestrates Confirm Payment end-to-end: confirm → (reuse existing
   * active token, or mint one via the exact same generateToken() call
   * OrderDownloadsCard's own effect uses) → send the exact same download
   * email OrderDownloadsCard's own button sends → attempt the separate
   * admin notification. Lives here, not in OrdersContext, because it needs
   * Downloads/Library/CommunicationTemplates — contexts OrdersProvider is
   * mounted above in AdminProviders and so cannot itself depend on.
   * OrderDownloadsCard is intentionally never modified: its own effect
   * already checks `!activeToken` before minting, so once this handler
   * mints a token the shared DownloadsContext state updates and that
   * effect naturally skips minting a second one — no duplicate-token race.
   */
  const handleConfirmPayment = async (): Promise<ConfirmPaymentFlowResult> => {
    if (!order) return { status: "error", message: "الطلب غير موجود." };

    const result = await confirmPayment(order.id);
    if (!result.ok) return { status: "error", message: result.error ?? "تعذر تأكيد الدفع." };
    if (result.alreadyConfirmed) return { status: "already-confirmed" };

    // Deliberately reads from the `order` prop closure, not a fresh
    // getOrder() call — the async continuation above may resume before (or
    // after) OrdersContext's own re-render commits, so re-fetching here
    // would risk reading a stale snapshot either way. Nothing needed below
    // (timeline for the email-sent check, items, id, customerEmail) is
    // affected by whether the just-appended "payment confirmed" timeline
    // entry is present in the copy read — only EMAIL_SENT_TIMELINE_LABEL
    // is ever searched for, and that couldn't have been added by the
    // confirm step itself.
    if (order.timeline.some((event) => event.label === EMAIL_SENT_TIMELINE_LABEL)) {
      const adminNotification = await attemptAdminNotification(false);
      return { status: "confirmed-no-email", reason: "تم إرسال بريد التحميل مسبقًا لهذا الطلب.", adminNotification };
    }

    const seen = new Set<string>();
    const linkedFiles = order.items.flatMap((item) =>
      getFilesForBook(item.bookId).filter((file) => {
        if (seen.has(file.id)) return false;
        seen.add(file.id);
        return true;
      })
    );

    if (linkedFiles.length === 0) {
      const adminNotification = await attemptAdminNotification(false);
      return {
        status: "confirmed-no-email",
        reason: "لا توجد ملفات رقمية مرتبطة بهذا الطلب لإرسالها.",
        adminNotification,
      };
    }

    const existingActiveToken = getTokensForOrder(order.id).find((token) => !token.disabled) ?? null;
    if (existingActiveToken) {
      // The raw, usable token only ever exists in memory right after
      // minting (see downloadTokensRepository.ts) — an already-existing
      // token from an earlier session has no recoverable link here, so
      // this deliberately does not fabricate a broken email.
      const adminNotification = await attemptAdminNotification(false);
      return {
        status: "confirmed-no-email",
        reason: "يوجد رابط تحميل نشط بالفعل — استخدمي قسم «التحميلات» أدناه لإرساله.",
        adminNotification,
      };
    }

    let rawToken: string;
    try {
      const minted = await generateToken(
        order.id,
        linkedFiles.map((file) => file.id)
      );
      rawToken = minted.rawToken;
    } catch (error) {
      console.error("Failed to generate download token during payment confirmation:", error);
      const adminNotification = await attemptAdminNotification(false);
      return { status: "confirmed-email-failed", reason: "تعذّر توليد رابط التحميل.", adminNotification };
    }

    const template = resolveTemplateForSending(DOWNLOAD_EMAIL_TEMPLATE_ID);
    if (!template) {
      const adminNotification = await attemptAdminNotification(false);
      return { status: "confirmed-email-failed", reason: "قالب رابط التحميل غير موجود.", adminNotification };
    }

    const downloadUrl = `${window.location.origin}/download/${rawToken}`;
    const sectionsWithRealLink = template.draft.map((section) =>
      section.type === "button" ? { ...section, fields: { ...section.fields, url: downloadUrl } } : section
    );
    const contentHtml = renderTemplateToHtml(sectionsWithRealLink);
    const book = order.items[0];

    let downloadEmailSent = false;
    try {
      await getEmailProvider("resend").sendDownloadEmail({
        to: order.customerEmail,
        orderId: order.id,
        downloadUrl,
        contentHtml,
        bookTitle: book?.title,
        bookCoverUrl: book?.cover ?? null,
        maxDownloads: null,
        expiresAt: null,
      });
      downloadEmailSent = true;
    } catch (error) {
      // Payment confirmation itself already succeeded and is not rolled
      // back — only the email step failed.
      console.error("Failed to send download email during payment confirmation:", error);
    }

    if (downloadEmailSent) {
      // Recorded only after the send actually succeeded.
      recordEmailSent(order.id);
      const adminNotification = await attemptAdminNotification(true);
      return { status: "confirmed-email-sent", adminNotification };
    }

    const adminNotification = await attemptAdminNotification(false);
    return { status: "confirmed-email-failed", reason: "حدث خطأ أثناء إرسال البريد الإلكتروني.", adminNotification };
  };

  if (!order) {
    return (
      <div className="flex flex-col gap-6 py-2">
        <EmptyState
          icon={IconBag}
          title="لم يتم العثور على الطلب"
          description="ربما تم حذف هذا الطلب أو أن الرابط غير صحيح."
          action={
            <button
              type="button"
              onClick={() => navigate("/admin/orders")}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-deep"
            >
              العودة إلى الطلبات
            </button>
          }
        />
      </div>
    );
  }

  const meta = ORDER_STATUS_META[order.status];

  return (
    <div className="flex flex-col gap-6 py-2">
      <Reveal>
        <div className="flex flex-col gap-4">
          <Link
            to="/admin/orders"
            className="inline-flex w-fit items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            <IconChevronStart className="h-3.5 w-3.5 rotate-180" />
            الطلبات
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl text-ink" dir="ltr">
              #{order.id}
            </h1>
            <StatusBadge variant={meta.variant}>{meta.label}</StatusBadge>
          </div>
          <p className="text-sm text-ink-soft">تم إنشاء الطلب في {order.createdAt}</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Reveal delay={0.05}>
            <OrderItemsCard order={order} />
          </Reveal>
          <Reveal delay={0.08}>
            <OrderDownloadsCard order={order} />
          </Reveal>
          <Reveal delay={0.1}>
            <OrderTimelineCard order={order} onAddNote={(text) => addNote(order.id, text)} />
          </Reveal>
        </div>

        <div className="flex flex-col gap-6">
          <Reveal delay={0.05}>
            <OrderCustomerCard order={order} />
          </Reveal>
          <Reveal delay={0.1}>
            <OrderPaymentCard
              order={order}
              onStatusChange={(status) => setOrderStatus(order.id, status)}
              onConfirmPayment={handleConfirmPayment}
            />
          </Reveal>
          <Reveal delay={0.12}>
            <OrderAttachmentsCard order={order} />
          </Reveal>
        </div>
      </div>
    </div>
  );
}

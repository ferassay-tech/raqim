import { Link, useNavigate, useParams } from "react-router-dom";
import { Reveal } from "@/components/motion-primitives";
import { useOrders, EMAIL_SENT_TIMELINE_LABEL } from "@/admin/context/OrdersContext";
import { useDownloads } from "@/admin/context/DownloadsContext";
import { useLibrary } from "@/admin/context/LibraryContext";
import { useCommunicationTemplates } from "@/admin/context/CommunicationTemplatesContext";
import { DOWNLOAD_EMAIL_TEMPLATE_ID } from "@/admin/data/communicationTemplatesData";
import { renderTemplateToHtml } from "@/admin/modules/communications/utils/renderTemplateToHtml";
import { getEmailProvider } from "@/admin/services/email";
import { ORDER_STATUS_META } from "@/admin/lib/orderStatus";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { OrderItemsCard } from "../components/OrderItemsCard";
import { OrderCustomerCard } from "../components/OrderCustomerCard";
import { OrderPaymentCard } from "../components/OrderPaymentCard";
import type { ConfirmPaymentFlowResult } from "../components/OrderPaymentCard";
import { OrderTimelineCard } from "../components/OrderTimelineCard";
import { OrderDownloadsCard } from "../components/OrderDownloadsCard";
import { OrderAttachmentsCard } from "../components/OrderAttachmentsCard";
import { IconBag, IconChevronStart } from "@/admin/icons";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrder, setOrderStatus, addNote, confirmPayment, recordEmailSent } = useOrders();
  const { getTokensForOrder, generateToken } = useDownloads();
  const { getFilesForBook } = useLibrary();
  const { resolveTemplateForSending } = useCommunicationTemplates();
  const order = id ? getOrder(id) : undefined;

  /**
   * Orchestrates Confirm Payment end-to-end: confirm → (reuse existing
   * active token, or mint one via the exact same generateToken() call
   * OrderDownloadsCard's own effect uses) → send the exact same download
   * email OrderDownloadsCard's own button sends. Lives here, not in
   * OrdersContext, because it needs Downloads/Library/CommunicationTemplates
   * — contexts OrdersProvider is mounted above in AdminProviders and so
   * cannot itself depend on. OrderDownloadsCard is intentionally never
   * modified: its own effect already checks `!activeToken` before minting,
   * so once this handler mints a token the shared DownloadsContext state
   * updates and that effect naturally skips minting a second one — no
   * duplicate-token race.
   *
   * Deliberately does NOT trigger any admin notification — the admin
   * purchase notification now fires once, earlier, from
   * OrdersContext.createOrder() at the moment the customer's order is
   * first persisted. Confirming payment here only ever affects the
   * customer's own download email, exactly as it did before that
   * notification existed.
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
      return { status: "confirmed-no-email", reason: "تم إرسال بريد التحميل مسبقًا لهذا الطلب." };
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
      return { status: "confirmed-no-email", reason: "لا توجد ملفات رقمية مرتبطة بهذا الطلب لإرسالها." };
    }

    const existingActiveToken = getTokensForOrder(order.id).find((token) => !token.disabled) ?? null;
    if (existingActiveToken) {
      // The raw, usable token only ever exists in memory right after
      // minting (see downloadTokensRepository.ts) — an already-existing
      // token from an earlier session has no recoverable link here, so
      // this deliberately does not fabricate a broken email.
      return {
        status: "confirmed-no-email",
        reason: "يوجد رابط تحميل نشط بالفعل — استخدمي قسم «التحميلات» أدناه لإرساله.",
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
      return { status: "confirmed-email-failed", reason: "تعذّر توليد رابط التحميل." };
    }

    const template = resolveTemplateForSending(DOWNLOAD_EMAIL_TEMPLATE_ID);
    if (!template) {
      return { status: "confirmed-email-failed", reason: "قالب رابط التحميل غير موجود." };
    }

    const downloadUrl = `${window.location.origin}/download/${rawToken}`;
    const sectionsWithRealLink = template.draft.map((section) =>
      section.type === "button" ? { ...section, fields: { ...section.fields, url: downloadUrl } } : section
    );
    const contentHtml = renderTemplateToHtml(sectionsWithRealLink);
    const book = order.items[0];

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
    } catch (error) {
      // Payment confirmation itself already succeeded and is not rolled
      // back — only the email step failed.
      console.error("Failed to send download email during payment confirmation:", error);
      return { status: "confirmed-email-failed", reason: "حدث خطأ أثناء إرسال البريد الإلكتروني." };
    }

    // Recorded only after the send actually succeeded.
    recordEmailSent(order.id);
    return { status: "confirmed-email-sent" };
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

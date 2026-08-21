import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "../components/Helmet";
import { getPaymentMethod } from "../config/paymentMethods";
import { CopyButton } from "../components/checkout/CopyButton";
import { PaymentConfirmationForm } from "../components/checkout/PaymentConfirmationForm";
import type { ConfirmationFormValues } from "../components/checkout/PaymentConfirmationForm";
import { iconMap } from "../components/checkout/icons";
import { IconArrowLeft } from "../components/checkout/icons";
import { useCheckout } from "../context/CheckoutContext";
import type { BookCurrency } from "../admin/types/book";
import { computeDiscountedPrice } from "../context/couponMath";
import { useOrders } from "../admin/context/OrdersContext";
import { useLanguage } from "../context/LanguageContext";
import { uploadOrderAttachment } from "../admin/context/orderAttachmentsRepository";

// Matches the original site's exact wording for the "required amount" line
// ("500 جنيه مصري", "30 شيكل") — full currency names, not ISO-style symbols.
function currencyName(currency: BookCurrency, t: (key: string) => string): string {
  if (currency === "USD") return "$";
  if (currency === "EGP") return t("payment.currency.egp");
  return t("payment.currency.ils");
}

function formatAmount(price: number, currency: BookCurrency, t: (key: string) => string): string {
  return currency === "USD" ? `$${price}` : `${price} ${currencyName(currency, t)}`;
}

const PaymentMethodPage: React.FC = () => {
  const { method } = useParams<{ method: string }>();
  const navigate = useNavigate();
  const { product, book, appliedCoupon, setConfirmation, checkoutAttemptId, resetCheckoutAttempt } = useCheckout();
  const { createOrder } = useOrders();
  const { t, dir, language, localizePath } = useLanguage();
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);
  const [attachmentUploadFailed, setAttachmentUploadFailed] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{ orderId: string; file: File } | null>(null);

  const config = getPaymentMethod(method);

  if (!config) {
    return (
      <main
        dir={dir}
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ivory px-4 text-center"
      >
        <p className="text-lg text-ink">{t("payment.notAvailable.title")}</p>
        <Link
          to={localizePath("/checkout")}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-beige"
        >
          {t("payment.notAvailable.backToCheckout")}
        </Link>
      </main>
    );
  }

  const Icon = iconMap[config.iconKey];
  const requiresConfirmation = config.requiresConfirmation !== false;

  const priceEntry = book?.prices[config.currency];
  const amountLabel = priceEntry
    ? formatAmount(computeDiscountedPrice(priceEntry.price, appliedCoupon), config.currency, t)
    : `${product.currency} ${product.newPrice}`;

  // The order is already created and paid-for by the time an attachment
  // upload could fail — a failed upload must never look like a failed
  // order, must never trigger a second createOrder() call, and should be
  // recoverable rather than silently dropping the file a second time (the
  // whole reason this feature exists is that the previous "upload" quietly
  // discarded the file already).
  //
  // Lifecycle correction: resetCheckoutAttempt() must NOT fire here just
  // because createOrder() resolved — the checkout attempt is only truly
  // over once there is no further post-order step that can fail and need
  // retrying. If it fired immediately after createOrder() (as it
  // originally did) and this upload then failed, a subsequent refresh +
  // resubmit would carry a brand-new attempt id — no longer recognized by
  // the database as the same attempt — and could create a second order
  // for what is still, from the customer's perspective, one purchase.
  // Reset only happens in this function's own success branch below (and
  // in handleSkipAttachment / the no-receipt branch in
  // handleConfirmationSubmit) — the three actual terminal transitions to
  // /order-received.
  const attemptAttachmentUpload = async (orderId: string, file: File) => {
    try {
      await uploadOrderAttachment(orderId, file);
      resetCheckoutAttempt();
      navigate(localizePath("/order-received"), { state: { orderId, attachmentFailed: false } });
    } catch (error) {
      console.error("Failed to upload order attachment:", error);
      setPendingAttachment({ orderId, file });
      setAttachmentUploadFailed(true);
    }
  };

  const handleConfirmationSubmit = async (values: ConfirmationFormValues) => {
    setConfirmation(values);
    const discountedPrice = appliedCoupon ? computeDiscountedPrice(product.newPrice, appliedCoupon) : product.newPrice;
    const order = await createOrder({
      customerName: values.fullName,
      customerEmail: values.email,
      paymentMethod: config.title,
      paymentMethodId: config.id,
      transactionId: values.transactionId || null,
      customerNotes: values.notes || null,
      items: [
        {
          bookId: book?.id ?? product.id,
          title: product.title,
          cover: product.coverImage,
          quantity: 1,
          unitPrice: product.newPrice,
        },
      ],
      discount: product.newPrice - discountedPrice,
      hasReceiptFile: Boolean(values.receiptFile),
      checkoutAttemptId,
    });

    // order.isExistingOrder is true when this exact checkout attempt had
    // already produced this order (a retried/duplicate submission) —
    // createOrder() resolved it via the DB's own unique constraint rather
    // than inserting a second row. A receipt is still attempted below
    // regardless: the realistic case that reaches this branch is the
    // upload having genuinely failed the first time (this attempt's id
    // was never reset, so the order still needs one), which is exactly
    // the case that must be retried, not skipped.
    if (values.receiptFile) {
      await attemptAttachmentUpload(order.id, values.receiptFile);
    } else {
      resetCheckoutAttempt();
      navigate(localizePath("/order-received"), { state: { orderId: order.id } });
    }
  };

  const handleRetryAttachment = () => {
    if (!pendingAttachment) return;
    setAttachmentUploadFailed(false);
    void attemptAttachmentUpload(pendingAttachment.orderId, pendingAttachment.file);
  };

  const handleSkipAttachment = () => {
    if (!pendingAttachment) return;
    resetCheckoutAttempt();
    navigate(localizePath("/order-received"), {
      state: { orderId: pendingAttachment.orderId, attachmentFailed: true },
    });
  };

  const actionTitle = requiresConfirmation ? t("payment.titlePay") : t("payment.titleBuy");

  return (
    <main dir={dir} className="min-h-screen bg-ivory px-4 py-16 sm:px-8">
      <Helmet
        title={`${actionTitle} ${config.title} — ${t("home.hero.titleFallback")}`}
        description={`${t("payment.seoDescriptionPrefix")}${config.title}${t("payment.seoDescriptionSuffix")}`}
        path={`/payment/${config.id}`}
        noindex
      />
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <Link
          to={localizePath("/checkout")}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-ink-soft transition hover:text-ink"
        >
          <IconArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("payment.backToMethods")}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-3xl border border-beige bg-white/70 p-6 shadow-[0_10px_40px_rgba(60,45,20,0.08)] backdrop-blur sm:p-8"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-beige text-gold-deep">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-semibold text-ink">
                {actionTitle} {config.title}
              </h1>
              {requiresConfirmation && (
                <p className="text-xs text-ink-soft">
                  {t("payment.amountRequiredPrefix")}{amountLabel}
                  {appliedCoupon && (
                    <span className="text-gold-deep">
                      {t("payment.afterCouponPrefix")}{appliedCoupon.code}{t("payment.afterCouponSuffix")}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          <ol className="mt-6 flex flex-col gap-2 text-sm text-ink">
            {config.instructions.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-beige text-[10px] font-medium text-gold-deep">
                  {i + 1}
                </span>
                {step[language]}
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-col gap-3">
            {config.fields.map((field) => (
              <div
                key={field.label.ar}
                className="flex items-center justify-between gap-3 rounded-xl bg-beige/60 px-4 py-3"
              >
                <div>
                  <p className="text-[11px] text-gold-deep">{field.label[language]}</p>
                  <p className="text-sm font-medium text-ink" dir="ltr">
                    {field.value}
                  </p>
                </div>
                {field.copyable && (
                  <CopyButton value={field.value} label={field.label[language]} />
                )}
              </div>
            ))}
          </div>

          {config.externalLink && (
            <a
              href={config.externalLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 block w-full rounded-full border border-gold py-2.5 text-center text-sm font-medium text-gold-deep transition hover:bg-beige"
            >
              {config.externalLink.label[language]}
            </a>
          )}

          {requiresConfirmation && !showConfirmationForm && (
            <button
              type="button"
              onClick={() => setShowConfirmationForm(true)}
              className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-medium text-beige transition hover:bg-gold-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            >
              {t("payment.completedButton")}
            </button>
          )}
        </motion.div>

        {requiresConfirmation && (
          <AnimatePresence>
            {attachmentUploadFailed ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4 rounded-3xl border border-danger/30 bg-danger/5 p-6 text-center"
              >
                <p className="text-sm text-danger">{t("payment.attachmentUploadFailed")}</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={handleRetryAttachment}
                    className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-beige transition hover:bg-gold-deep"
                  >
                    {t("payment.attachmentRetry")}
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipAttachment}
                    className="rounded-full border border-gold px-6 py-2.5 text-sm font-medium text-gold-deep transition hover:bg-beige"
                  >
                    {t("payment.attachmentSkip")}
                  </button>
                </div>
              </motion.div>
            ) : (
              showConfirmationForm && (
                <PaymentConfirmationForm
                  methodTitle={config.title}
                  onSubmit={handleConfirmationSubmit}
                />
              )
            )}
          </AnimatePresence>
        )}
      </div>
    </main>
  );
};

export default PaymentMethodPage;

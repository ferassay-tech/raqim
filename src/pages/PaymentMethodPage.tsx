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

// Matches the original site's exact wording for the "required amount" line
// ("500 جنيه مصري", "30 شيكل") — full currency names, not ISO-style symbols.
const CURRENCY_NAME: Record<BookCurrency, string> = {
  USD: "$",
  EGP: "جنيه مصري",
  ILS: "شيكل",
};

function formatAmount(price: number, currency: BookCurrency): string {
  return currency === "USD" ? `$${price}` : `${price} ${CURRENCY_NAME[currency]}`;
}

const PaymentMethodPage: React.FC = () => {
  const { method } = useParams<{ method: string }>();
  const navigate = useNavigate();
  const { product, book, appliedCoupon, setConfirmation } = useCheckout();
  const { createOrder } = useOrders();
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);

  const config = getPaymentMethod(method);

  if (!config) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ivory px-4 text-center"
      >
        <p className="text-lg text-ink">طريقة الدفع غير متاحة</p>
        <Link
          to="/checkout"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-beige"
        >
          العودة لصفحة الدفع
        </Link>
      </main>
    );
  }

  const Icon = iconMap[config.iconKey];
  const requiresConfirmation = config.requiresConfirmation !== false;

  const priceEntry = book?.prices[config.currency];
  const amountLabel = priceEntry
    ? formatAmount(computeDiscountedPrice(priceEntry.price, appliedCoupon), config.currency)
    : `${product.currency} ${product.newPrice}`;

  const handleConfirmationSubmit = (values: ConfirmationFormValues) => {
    setConfirmation(values);
    const discountedPrice = appliedCoupon ? computeDiscountedPrice(product.newPrice, appliedCoupon) : product.newPrice;
    const order = createOrder({
      customerName: values.fullName,
      customerEmail: values.email,
      paymentMethod: config.title,
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
    });
    navigate("/order-received", { state: { orderId: order.id } });
  };

  return (
    <main dir="rtl" className="min-h-screen bg-ivory px-4 py-16 sm:px-8">
      <Helmet
        title={`${requiresConfirmation ? "الدفع عبر" : "شراء الكتاب عبر"} ${config.title} — رقيم`}
        description={`أكملي الدفع عبر ${config.title} للحصول على نسختك الرقمية.`}
        path={`/payment/${config.id}`}
        noindex
      />
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <Link
          to="/checkout"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-ink-soft transition hover:text-ink"
        >
          <IconArrowLeft className="h-4 w-4 rotate-180" />
          العودة لطرق الدفع
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
                {requiresConfirmation ? "الدفع عبر" : "شراء الكتاب عبر"} {config.title}
              </h1>
              {requiresConfirmation && (
                <p className="text-xs text-ink-soft">
                  المبلغ المطلوب: {amountLabel}
                  {appliedCoupon && <span className="text-gold-deep"> (بعد كود {appliedCoupon.code})</span>}
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
                {step}
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-col gap-3">
            {config.fields.map((field) => (
              <div
                key={field.label}
                className="flex items-center justify-between gap-3 rounded-xl bg-beige/60 px-4 py-3"
              >
                <div>
                  <p className="text-[11px] text-gold-deep">{field.label}</p>
                  <p className="text-sm font-medium text-ink" dir="ltr">
                    {field.value}
                  </p>
                </div>
                {field.copyable && (
                  <CopyButton value={field.value} label={field.label} />
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
    {config.externalLink.label}
  </a>
)}

          {requiresConfirmation && !showConfirmationForm && (
            <button
              type="button"
              onClick={() => setShowConfirmationForm(true)}
              className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-medium text-beige transition hover:bg-gold-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            >
              لقد أتممت الدفع
            </button>
          )}
        </motion.div>

        {requiresConfirmation && (
          <AnimatePresence>
            {showConfirmationForm && (
              <PaymentConfirmationForm
                methodTitle={config.title}
                onSubmit={handleConfirmationSubmit}
              />
            )}
          </AnimatePresence>
        )}
      </div>
    </main>
  );
};

export default PaymentMethodPage;
import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getPaymentMethod } from "../config/paymentMethods";
import { CopyButton } from "../components/checkout/CopyButton";
import { PaymentConfirmationForm } from "../components/checkout/PaymentConfirmationForm";
import type { ConfirmationFormValues } from "../components/checkout/PaymentConfirmationForm";
import { iconMap } from "../components/checkout/icons";
import { IconArrowLeft } from "../components/checkout/icons";
import { useCheckout } from "../context/CheckoutContext";

const PaymentMethodPage: React.FC = () => {
  const { method } = useParams<{ method: string }>();
  const navigate = useNavigate();
  const { product, setConfirmation } = useCheckout();
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);

  const config = getPaymentMethod(method);

  if (!config) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#faf6ef] px-4 text-center"
      >
        <p className="text-lg text-[#2c2416]">طريقة الدفع غير متاحة</p>
        <Link
          to="/checkout"
          className="rounded-full bg-[#2c2416] px-5 py-2.5 text-sm font-medium text-[#f4ecd8]"
        >
          العودة لصفحة الدفع
        </Link>
      </main>
    );
  }

  const Icon = iconMap[config.iconKey];
  const requiresConfirmation = config.requiresConfirmation !== false;

  const handleConfirmationSubmit = (values: ConfirmationFormValues) => {
    setConfirmation(values);
    navigate("/order-received");
  };

  return (
    <main dir="rtl" className="min-h-screen bg-[#faf6ef] px-4 py-16 sm:px-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <Link
          to="/checkout"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-[#7a6a52] transition hover:text-[#2c2416]"
        >
          <IconArrowLeft className="h-4 w-4 rotate-180" />
          العودة لطرق الدفع
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-3xl border border-[#e8ddc8] bg-white/70 p-6 shadow-[0_10px_40px_rgba(60,45,20,0.08)] backdrop-blur sm:p-8"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4ecd8] text-[#8a6d3b]">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-semibold text-[#2c2416]">
                {requiresConfirmation ? "الدفع عبر" : "شراء الكتاب عبر"} {config.title}
              </h1>
              {requiresConfirmation && (
                <p className="text-xs text-[#7a6a52]">
                  المبلغ المطلوب: {config.amount ?? `${product.currency} ${product.newPrice}`}
                </p>
              )}
            </div>
          </div>

          <ol className="mt-6 flex flex-col gap-2 text-sm text-[#4a3c22]">
            {config.instructions.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f4ecd8] text-[10px] font-medium text-[#8a6d3b]">
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
                className="flex items-center justify-between gap-3 rounded-xl bg-[#f4ecd8]/60 px-4 py-3"
              >
                <div>
                  <p className="text-[11px] text-[#8a6d3b]">{field.label}</p>
                  <p className="text-sm font-medium text-[#2c2416]" dir="ltr">
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
    className="mt-5 block w-full rounded-full border border-[#b08d4f] py-2.5 text-center text-sm font-medium text-[#8a6d3b] transition hover:bg-[#f4ecd8]"
  >
    {config.externalLink.label}
  </a>
)}

          {requiresConfirmation && !showConfirmationForm && (
            <button
              type="button"
              onClick={() => setShowConfirmationForm(true)}
              className="mt-6 w-full rounded-full bg-[#2c2416] py-3 text-sm font-medium text-[#f4ecd8] transition hover:bg-[#40331f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b08d4f] focus-visible:ring-offset-2"
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
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckoutHero } from "../components/checkout/CheckoutHero";
import { ProductSummaryCard } from "../components/checkout/ProductSummaryCard";
import { PaymentMethodCard } from "../components/checkout/PaymentMethodCard";
import { IconArrowLeft } from "../components/checkout/icons";
import { useCheckout } from "../context/CheckoutContext";
import { paymentMethodList } from "../config/paymentMethods";
import type { PaymentMethodId } from "../config/paymentMethods";

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { product, setSelectedMethodId } = useCheckout();

  const handleSelectMethod = (id: PaymentMethodId) => {
    setSelectedMethodId(id);
    navigate(`/payment/${id}`);
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#faf6ef] px-4 py-16 sm:px-8"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <Link
          to="/books/kuni-hajar"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-[#7a6a52] transition hover:text-[#2c2416]"
        >
          <IconArrowLeft className="h-4 w-4 rotate-180" />
          العودة إلى صفحة الكتاب
        </Link>

        <CheckoutHero title={product.title} />

        <ProductSummaryCard product={product} />

        <section aria-labelledby="payment-methods-heading">
          <h2
            id="payment-methods-heading"
            className="mb-4 text-center text-lg font-semibold text-[#2c2416]"
          >
            اختر طريقة الدفع
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {paymentMethodList.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                onSelect={handleSelectMethod}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default CheckoutPage;
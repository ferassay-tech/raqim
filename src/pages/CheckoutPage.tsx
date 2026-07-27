import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "../components/Helmet";
import { CheckoutHero } from "../components/checkout/CheckoutHero";
import { ProductSummaryCard } from "../components/checkout/ProductSummaryCard";
import { PaymentMethodCard } from "../components/checkout/PaymentMethodCard";
import { IconArrowLeft } from "../components/checkout/icons";
import { useCheckout } from "../context/CheckoutContext";
import { computeDiscountedPrice } from "../context/couponMath";
import { paymentMethodList } from "../config/paymentMethods";
import type { PaymentMethodId } from "../config/paymentMethods";
import { useCoupons } from "../admin/context/CouponsContext";
import { getCouponStatus } from "../admin/lib/couponStatus";

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { product, book, appliedCoupon, setAppliedCoupon, setSelectedMethodId } = useCheckout();
  const { coupons } = useCoupons();
  const [couponInput, setCouponInput] = useState(appliedCoupon?.code ?? "");
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const match = coupons.find((c) => c.code.toUpperCase() === code);
    if (!match || getCouponStatus(match) !== "active") {
      setCouponError("هذا الكود غير صالح حاليًا.");
      setAppliedCoupon(null);
      return;
    }
    setCouponError(null);
    setAppliedCoupon({ code: match.code, type: match.type, value: match.value });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  };

  const discountedPrice = appliedCoupon
    ? computeDiscountedPrice(product.newPrice, appliedCoupon)
    : undefined;

  const handleSelectMethod = (id: PaymentMethodId) => {
    setSelectedMethodId(id);
    navigate(`/payment/${id}`);
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-ivory px-4 py-16 sm:px-8"
    >
      <Helmet title="إتمام الشراء — رقيم" url="https://r-aqim.com/checkout" />
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <Link
          to={book ? `/books/${book.id}` : "/books"}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-ink-soft transition hover:text-ink"
        >
          <IconArrowLeft className="h-4 w-4 rotate-180" />
          العودة إلى صفحة الكتاب
        </Link>

        <CheckoutHero title={product.title} />

        <ProductSummaryCard
          product={product}
          discountedPrice={discountedPrice}
          appliedCouponCode={appliedCoupon?.code}
        />

        <section aria-labelledby="coupon-heading" className="flex flex-col gap-2">
          <h2 id="coupon-heading" className="text-sm font-medium text-ink">
            كود الخصم
          </h2>
          {appliedCoupon ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-beige/60 px-4 py-3 text-sm">
              <span className="text-ink">
                تم تطبيق الكود <strong className="text-gold-deep">{appliedCoupon.code}</strong>
              </span>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-xs text-ink-soft underline hover:text-ink"
              >
                إزالة
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="أدخلي كود الخصم"
                  dir="ltr"
                  className="flex-1 rounded-xl border border-beige bg-white/70 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="shrink-0 rounded-xl border border-gold px-4 py-2.5 text-sm font-medium text-gold-deep transition hover:bg-beige"
                >
                  تطبيق
                </button>
              </div>
              {couponError && <p className="text-xs text-danger">{couponError}</p>}
            </div>
          )}
        </section>

        <section aria-labelledby="payment-methods-heading">
          <h2
            id="payment-methods-heading"
            className="mb-4 text-center text-lg font-semibold text-ink"
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
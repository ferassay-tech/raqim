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
import { getSupabaseClient } from "../lib/supabaseClient";
import { useLanguage } from "../context/LanguageContext";

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { product, book, appliedCoupon, setAppliedCoupon, setSelectedMethodId } = useCheckout();
  const { t, dir, localizePath } = useLanguage();
  const [couponInput, setCouponInput] = useState(appliedCoupon?.code ?? "");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  // Validated server-side via the validate_coupon_code() RPC rather than a
  // client-side lookup against the full coupons table — the anon role no
  // longer has direct SELECT on public.coupons (Phase 1 security
  // hardening, Finding 6: that table previously let any visitor read
  // every coupon row, including disabled ones and internal usage counts).
  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCheckingCoupon(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.rpc("validate_coupon_code", { p_code: code });
      const match = Array.isArray(data) ? data[0] : null;
      if (error || !match || !match.is_valid) {
        setCouponError(t("checkout.coupon.invalid"));
        setAppliedCoupon(null);
        return;
      }
      setCouponError(null);
      setAppliedCoupon({ code: match.code, type: match.type, value: match.value });
    } finally {
      setCheckingCoupon(false);
    }
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
    navigate(localizePath(`/payment/${id}`));
  };

  return (
    <main
      dir={dir}
      className="min-h-screen bg-ivory px-4 py-16 sm:px-8"
    >
      <Helmet
        title={t("checkout.seo.title")}
        description={t("checkout.seo.description")}
        path="/checkout"
        noindex
      />
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <Link
          to={localizePath(book ? `/books/${book.id}` : "/books")}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-ink-soft transition hover:text-ink"
        >
          <IconArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("checkout.backToBook")}
        </Link>

        <CheckoutHero title={product.title} />

        <ProductSummaryCard
          product={product}
          discountedPrice={discountedPrice}
          appliedCouponCode={appliedCoupon?.code}
        />

        <section aria-labelledby="coupon-heading" className="flex flex-col gap-2">
          <h2 id="coupon-heading" className="text-sm font-medium text-ink">
            {t("checkout.coupon.heading")}
          </h2>
          {appliedCoupon ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-beige/60 px-4 py-3 text-sm">
              <span className="text-ink">
                {t("checkout.coupon.appliedPrefix")}<strong className="text-gold-deep">{appliedCoupon.code}</strong>
              </span>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-xs text-ink-soft underline hover:text-ink"
              >
                {t("checkout.coupon.remove")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={t("checkout.coupon.placeholder")}
                  dir="ltr"
                  className="flex-1 rounded-xl border border-beige bg-white/70 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => void handleApplyCoupon()}
                  disabled={checkingCoupon}
                  aria-busy={checkingCoupon}
                  className="shrink-0 rounded-xl border border-gold px-4 py-2.5 text-sm font-medium text-gold-deep transition hover:bg-beige disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {checkingCoupon ? t("checkout.coupon.applying") : t("checkout.coupon.apply")}
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
            {t("checkout.methods.heading")}
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
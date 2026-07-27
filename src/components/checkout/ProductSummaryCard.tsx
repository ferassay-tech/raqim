import React from "react";
import { motion } from "framer-motion";
import type { Product } from "../../types/product";

interface ProductSummaryCardProps {
  product: Product;
  /** The price after an applied coupon, when it differs from `product.newPrice`. */
  discountedPrice?: number;
  appliedCouponCode?: string;
}

export const ProductSummaryCard: React.FC<ProductSummaryCardProps> = ({
  product,
  discountedPrice,
  appliedCouponCode,
}) => {
  const discountPercent = Math.round(
    ((product.oldPrice - product.newPrice) / product.oldPrice) * 100
  );
  const hasCouponDiscount = discountedPrice !== undefined && discountedPrice !== product.newPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      className="flex flex-col gap-6 rounded-3xl border border-beige bg-white/70 p-6 shadow-[0_10px_40px_rgba(60,45,20,0.08)] backdrop-blur sm:flex-row sm:items-center"
    >
      <div className="mx-auto h-40 w-28 shrink-0 overflow-hidden rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] sm:mx-0">
        <img
          src={product.coverImage}
          alt={product.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex-1 text-center sm:text-right">
        <h2 className="text-xl font-semibold text-ink">
          {product.title}
        </h2>
        {product.subtitle && (
          <p className="mt-1 text-sm text-ink-soft">{product.subtitle}</p>
        )}

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-ink-soft sm:text-sm">
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <dt className="text-ink-faint">اللغة</dt>
            <dd>{product.language}</dd>
          </div>
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <dt className="text-ink-faint">عدد الصفحات</dt>
            <dd>{product.pages}</dd>
          </div>
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <dt className="text-ink-faint">الصيغة</dt>
            <dd>{product.format}</dd>
          </div>
        </dl>

        <p className="mt-4 rounded-xl bg-beige/70 px-3 py-2 text-xs text-gold-deep sm:text-sm">
          {product.deliveryNotice}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1 sm:items-end">
        <span className="text-xs text-ink-faint line-through">
          {product.currency} {hasCouponDiscount ? product.newPrice : product.oldPrice}
        </span>
        <span className="text-2xl font-semibold text-ink">
          {product.currency} {hasCouponDiscount ? discountedPrice : product.newPrice}
        </span>
        <span className="rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-medium text-beige">
          {hasCouponDiscount ? `كود ${appliedCouponCode}` : `خصم ${discountPercent}%`}
        </span>
      </div>
    </motion.div>
  );
};
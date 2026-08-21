import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";
import type { Product } from "../types/product";
import type { PaymentMethodId } from "../config/paymentMethods";
import { defaultProduct } from "../data/products";
import { useBooks } from "../admin/context/BooksContext";
import { isInLibraryGrid } from "../admin/lib/bookPlacement";
import type { AdminBook } from "../admin/types/book";
import type { AppliedCoupon } from "./couponMath";

interface ConfirmationData {
  fullName: string;
  email: string;
  country: string;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
  receiptFileName?: string;
}

interface CheckoutContextValue {
  product: Product;
  /** The full live book record behind `product` — carries the per-currency
   * prices that `Product` (a single-currency shape) can't. */
  book: AdminBook | undefined;
  selectedMethodId: PaymentMethodId | null;
  setSelectedMethodId: (id: PaymentMethodId) => void;
  confirmation: ConfirmationData | null;
  setConfirmation: (data: ConfirmationData) => void;
  appliedCoupon: AppliedCoupon | null;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  /** Identifies one checkout attempt end-to-end — generated once,
   * persisted across a refresh of the same attempt, and passed through to
   * createOrder() so the database's own unique constraint (not just a
   * frontend guard) can recognize a repeated submission of the same
   * attempt as the same order rather than a new one. See
   * resetCheckoutAttempt for when a fresh one is minted. */
  checkoutAttemptId: string;
  /** Call once a checkout attempt has produced a definitive order (new or
   * resolved-as-duplicate) — mints a fresh attempt id so a genuinely new,
   * later purchase is never blocked by the just-completed attempt's id. */
  resetCheckoutAttempt: () => void;
}

const STORAGE_KEY = "raqim_checkout_state_v1";
const ATTEMPT_ID_STORAGE_KEY = "raqim_checkout_attempt_id_v1";

function createAttemptId(): string {
  return crypto.randomUUID();
}

function readOrCreateAttemptId(): string {
  try {
    const existing = sessionStorage.getItem(ATTEMPT_ID_STORAGE_KEY);
    if (existing) return existing;
  } catch {
    /* ignore storage access errors — fall through to a fresh id */
  }
  const id = createAttemptId();
  try {
    sessionStorage.setItem(ATTEMPT_ID_STORAGE_KEY, id);
  } catch {
    /* ignore quota/availability errors */
  }
  return id;
}

const CheckoutContext = createContext<CheckoutContextValue | undefined>(
  undefined
);

export const CheckoutProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { books } = useBooks();

  // The Admin manages many books, but checkout is single-product today — the
  // first non-deleted, publicly-listed, actually-priced book is the one
  // purchasable item, read live from the shared store instead of the old
  // static defaultProduct. Requiring a USD price excludes "coming soon"
  // stubs, which are publicly listed but not yet for sale.
  const purchasableBook = useMemo(
    () =>
      [...books]
        .filter((b) => b.deletedAt === null && isInLibraryGrid(b.placement) && b.prices.USD)
        .sort((a, b) => a.displayOrder - b.displayOrder)[0],
    [books]
  );

  const product: Product = useMemo(() => {
    if (!purchasableBook) return defaultProduct;
    const usd = purchasableBook.prices.USD;
    return {
      id: purchasableBook.id,
      slug: purchasableBook.id,
      title: purchasableBook.title,
      subtitle: purchasableBook.subtitle,
      coverImage: purchasableBook.cover ?? "",
      oldPrice: usd?.compareAtPrice ?? usd?.price ?? 0,
      newPrice: usd?.price ?? 0,
      currency: "$",
      language: purchasableBook.language,
      pages: purchasableBook.pages,
      format: purchasableBook.format,
      deliveryNotice: "يصلك رابط التحميل عبر البريد الإلكتروني فور تأكيد الدفع",
    };
  }, [purchasableBook]);

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const [selectedMethodId, setSelectedMethodId] =
    useState<PaymentMethodId | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(
    null
  );

  const [checkoutAttemptId, setCheckoutAttemptId] = useState<string>(() =>
    readOrCreateAttemptId()
  );

  const resetCheckoutAttempt = useCallback(() => {
    const id = createAttemptId();
    try {
      sessionStorage.setItem(ATTEMPT_ID_STORAGE_KEY, id);
    } catch {
      /* ignore quota/availability errors */
    }
    setCheckoutAttemptId(id);
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ selectedMethodId, confirmation })
      );
    } catch {
      /* ignore quota errors */
    }
  }, [selectedMethodId, confirmation]);

  return (
    <CheckoutContext.Provider
      value={{
        product,
        book: purchasableBook,
        selectedMethodId,
        setSelectedMethodId,
        confirmation,
        setConfirmation,
        appliedCoupon,
        setAppliedCoupon,
        checkoutAttemptId,
        resetCheckoutAttempt,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = (): CheckoutContextValue => {
  const ctx = useContext(CheckoutContext);
  if (!ctx) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return ctx;
};
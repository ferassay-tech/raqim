import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";
import type { Product } from "../types/product";
import type { PaymentMethodId } from "../config/paymentMethods";
import { defaultProduct } from "../data/products";

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
  setProduct: (product: Product) => void;
  selectedMethodId: PaymentMethodId | null;
  setSelectedMethodId: (id: PaymentMethodId) => void;
  confirmation: ConfirmationData | null;
  setConfirmation: (data: ConfirmationData) => void;
}

const STORAGE_KEY = "lumora_checkout_state_v1";

const CheckoutContext = createContext<CheckoutContextValue | undefined>(
  undefined
);

export const CheckoutProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Only one real product exists on the site right now, so `product` always
  // comes from the current defaultProduct — it is intentionally not read
  // back from sessionStorage. Restoring a cached product here previously
  // meant a stale placeholder, once stored in a browser tab, would silently
  // keep overriding corrected data forever, since nothing re-validated it
  // against the live source of truth.
  const [product, setProduct] = useState<Product>(defaultProduct);

  const [selectedMethodId, setSelectedMethodId] =
    useState<PaymentMethodId | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(
    null
  );

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
        setProduct,
        selectedMethodId,
        setSelectedMethodId,
        confirmation,
        setConfirmation,
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
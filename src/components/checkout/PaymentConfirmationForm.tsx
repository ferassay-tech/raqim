import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

export interface ConfirmationFormValues {
  fullName: string;
  email: string;
  country: string;
  paymentMethod: string;
  transactionId: string;
  notes: string;
  receiptFileName?: string;
}

interface PaymentConfirmationFormProps {
  methodTitle: string;
  onSubmit: (values: ConfirmationFormValues) => void;
}

const inputClasses =
  "w-full rounded-xl border border-beige bg-white/80 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:border-transparent";

export const PaymentConfirmationForm: React.FC<PaymentConfirmationFormProps> = ({
  methodTitle,
  onSubmit,
}) => {
  const { t } = useLanguage();
  const [values, setValues] = useState<ConfirmationFormValues>({
    fullName: "",
    email: "",
    country: "",
    paymentMethod: methodTitle,
    transactionId: "",
    notes: "",
    receiptFileName: undefined,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValues((prev) => ({ ...prev, receiptFileName: file?.name }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-3xl border border-beige bg-white/70 p-6 shadow-[0_10px_40px_rgba(60,45,20,0.08)] backdrop-blur"
      aria-labelledby="confirmation-form-heading"
    >
      <h2
        id="confirmation-form-heading"
        className="text-lg font-semibold text-ink"
      >
        {t("confirmationForm.heading")}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-xs text-ink-soft">
            {t("confirmationForm.fullName")}
          </label>
          <input
            id="fullName"
            name="fullName"
            required
            value={values.fullName}
            onChange={handleChange}
            className={inputClasses}
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs text-ink-soft">
            {t("confirmationForm.email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={values.email}
            onChange={handleChange}
            className={inputClasses}
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="country" className="mb-1.5 block text-xs text-ink-soft">
            {t("confirmationForm.country")}
          </label>
          <input
            id="country"
            name="country"
            required
            value={values.country}
            onChange={handleChange}
            className={inputClasses}
            autoComplete="country-name"
          />
        </div>

        <div>
          <label htmlFor="paymentMethod" className="mb-1.5 block text-xs text-ink-soft">
            {t("confirmationForm.paymentMethod")}
          </label>
          <input
            id="paymentMethod"
            name="paymentMethod"
            value={values.paymentMethod}
            readOnly
            className={`${inputClasses} cursor-not-allowed bg-beige/60`}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="transactionId" className="mb-1.5 block text-xs text-ink-soft">
            {t("confirmationForm.transactionId")}
          </label>
          <input
            id="transactionId"
            name="transactionId"
            value={values.transactionId}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="receipt" className="mb-1.5 block text-xs text-ink-soft">
            {t("confirmationForm.uploadReceipt")}
          </label>
          <input
            id="receipt"
            name="receipt"
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFile}
            className="w-full text-xs text-ink-soft file:ms-3 file:rounded-full file:border-0 file:bg-beige file:px-4 file:py-2 file:text-xs file:font-medium file:text-gold-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          />
          {values.receiptFileName && (
            <p className="mt-1.5 text-xs text-ink-soft">
              {t("confirmationForm.attachedFilePrefix")}{values.receiptFileName}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="notes" className="mb-1.5 block text-xs text-ink-soft">
            {t("confirmationForm.notes")}
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={values.notes}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-2 w-full rounded-full bg-ink py-3 text-sm font-medium text-beige transition hover:bg-gold-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
      >
        {t("confirmationForm.submit")}
      </button>
    </motion.form>
  );
};

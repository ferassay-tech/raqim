import React, { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useLanguage } from "../../context/LanguageContext";
import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
} from "../../admin/context/orderAttachmentsRepository";
import { cardSurface } from "../ui/Card";

export interface ConfirmationFormValues {
  fullName: string;
  email: string;
  country: string;
  paymentMethod: string;
  notes: string;
  /** The real selected file, kept until upload after order creation — see
   * PaymentMethodPage.handleConfirmationSubmit. Previously only file.name
   * was captured here and the bytes were discarded entirely. */
  receiptFile?: File;
}

interface PaymentConfirmationFormProps {
  methodTitle: string;
  onSubmit: (values: ConfirmationFormValues) => void | Promise<void>;
}

const inputClasses =
  "w-full rounded-xl border border-beige bg-white/80 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:border-transparent";

export const PaymentConfirmationForm: React.FC<PaymentConfirmationFormProps> = ({
  methodTitle,
  onSubmit,
}) => {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [values, setValues] = useState<ConfirmationFormValues>({
    fullName: "",
    email: "",
    country: "",
    paymentMethod: methodTitle,
    notes: "",
    receiptFile: undefined,
  });
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Synchronous guard: a ref updates instantly, before React's isSubmitting
  // state has re-rendered the disabled button — the actual window rapid
  // repeat clicks/Enter-key presses exploit. isSubmitting alone is one
  // render behind and is not enough on its own.
  const submittingRef = useRef(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  // The accept attribute is a picker hint only — real enforcement happens
  // here (and again server-side: the bucket's own allowed_mime_types/
  // file_size_limit), never trusted from the client alone.
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setValues((prev) => ({ ...prev, receiptFile: undefined }));
      setFileError(null);
      return;
    }
    if (!(ALLOWED_ATTACHMENT_MIME_TYPES as readonly string[]).includes(file.type)) {
      setFileError(t("confirmationForm.fileTypeError"));
      setValues((prev) => ({ ...prev, receiptFile: undefined }));
      e.target.value = "";
      return;
    }
    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      setFileError(t("confirmationForm.fileSizeError"));
      setValues((prev) => ({ ...prev, receiptFile: undefined }));
      e.target.value = "";
      return;
    }
    setFileError(null);
    setValues((prev) => ({ ...prev, receiptFile: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      // Always restored — including after a failed/recoverable submission
      // — so the button never becomes permanently stuck disabled.
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.5, ease: "easeOut" }}
      onSubmit={handleSubmit}
      className={cardSurface("focal", "flex flex-col gap-5")}
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
          <label htmlFor="receipt" className="mb-1.5 block text-xs text-ink-soft">
            {t("confirmationForm.uploadReceipt")}
          </label>
          <input
            id="receipt"
            name="receipt"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFile}
            className="w-full text-xs text-ink-soft file:ms-3 file:rounded-full file:border-0 file:bg-beige file:px-4 file:py-2 file:text-xs file:font-medium file:text-gold-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          />
          {values.receiptFile && (
            <p className="mt-1.5 text-xs text-ink-soft">
              {t("confirmationForm.attachedFilePrefix")}{values.receiptFile.name}
            </p>
          )}
          {fileError && <p className="mt-1.5 text-xs text-danger">{fileError}</p>}
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
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="mt-2 w-full rounded-full bg-ink py-3 text-sm font-medium text-beige transition hover:bg-gold-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? t("confirmationForm.submitting") : t("confirmationForm.submit")}
      </button>
    </motion.form>
  );
};

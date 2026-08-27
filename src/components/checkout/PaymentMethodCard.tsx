import React from "react";
import { motion, useReducedMotion } from "motion/react";
import type { PaymentMethodConfig } from "../../config/paymentMethods";
import { iconMap as icons } from "./icons";
import { useLanguage } from "../../context/LanguageContext";
import { cardSurface } from "../ui/Card";

interface PaymentMethodCardProps {
  method: PaymentMethodConfig;
  onSelect: (id: PaymentMethodConfig["id"]) => void;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  onSelect,
}) => {
  const Icon = icons[method.iconKey];
  const { t, language } = useLanguage();
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cardSurface("option", "flex flex-col justify-between gap-4")}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-beige text-gold-deep">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-ink">
            {method.title}
          </h3>
          <p className="text-xs text-ink-soft">{method.shortDescription[language]}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSelect(method.id)}
        aria-label={`${t("paymentMethodCard.selectAriaPrefix")}${method.title}`}
        className="w-full rounded-full bg-ink py-2.5 text-sm font-medium text-beige transition hover:bg-gold-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
      >
        {t("paymentMethodCard.continue")}
      </button>
    </motion.div>
  );
};

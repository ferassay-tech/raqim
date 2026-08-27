import React from "react";
import { motion } from "motion/react";

interface HeroContentProps {
  headlineDelay?: number;
  descriptionDelay?: number;
  ctaDelay?: number;
  onPrimaryCta?: () => void;
  onSecondaryCta?: () => void;
}

export const HeroContent: React.FC<HeroContentProps> = ({
  headlineDelay = 0,
  descriptionDelay = 0,
  ctaDelay = 0,
  onPrimaryCta,
  onSecondaryCta,
}) => {
  return (
    <div
      dir="rtl"
      className="hero-content-layer flex flex-col items-center gap-5 px-6 text-center"
      style={{ position: "relative", zIndex: 8 }}
    >
      <motion.h1
        className="hero-heading text-4xl font-semibold text-[#2c2416] sm:text-5xl md:text-6xl"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: headlineDelay }}
      >
        كوني هاجر
      </motion.h1>

      <motion.p
        className="max-w-xl text-sm leading-relaxed text-[#5c503a] sm:text-base"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: descriptionDelay }}
      >
        رحلة امرأة آمنت بالله فصنعت من الصحراء معجزة، ومن اليقين زمزمًا. دروس
        من سيرة هاجر عليها السلام، لأم تصنع الأجيال وتواجه التحديات بقلب
        مطمئن.
      </motion.p>

      <motion.div
        className="mt-2 flex flex-col items-center gap-3 sm:flex-row"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: ctaDelay }}
      >
        <motion.button
          type="button"
          onClick={onPrimaryCta}
          whileHover={{ y: -2, boxShadow: "0 12px 30px rgba(44,36,22,0.25)" }}
          whileTap={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="rounded-full bg-[#2c2416] px-8 py-3 text-sm font-medium text-[#f4ecd8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b08d4f] focus-visible:ring-offset-2"
        >
          اقتني نسختك
        </motion.button>

        <motion.a
          href="#introduction"
          onClick={onSecondaryCta}
          whileHover={{ letterSpacing: "0.04em" }}
          transition={{ duration: 0.3 }}
          className="text-sm font-medium text-[#7a6a52] underline-offset-4 transition hover:text-[#2c2416] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b08d4f] focus-visible:ring-offset-2"
        >
          اقرئي المقدمة
        </motion.a>
      </motion.div>
    </div>
  );
};
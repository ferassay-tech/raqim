import React from "react";
import { motion } from "motion/react";

interface HeroScrollIndicatorProps {
  delay?: number;
  reducedMotion?: boolean;
}

export const HeroScrollIndicator: React.FC<HeroScrollIndicatorProps> = ({
  delay = 0,
  reducedMotion = false,
}) => {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-8 left-1/2"
      style={{ zIndex: 9, translateX: "-50%" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      aria-hidden="true"
    >
      <motion.svg
        width="22"
        height="34"
        viewBox="0 0 22 34"
        fill="none"
        animate={reducedMotion ? undefined : { y: [0, 8, 0] }}
        transition={
          reducedMotion
            ? undefined
            : { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <rect
          x="1"
          y="1"
          width="20"
          height="32"
          rx="10"
          stroke="#8a6d3b"
          strokeWidth="1.3"
        />
        <motion.circle
          cx="11"
          cy="10"
          r="2.4"
          fill="#8a6d3b"
          animate={reducedMotion ? undefined : { cy: [10, 18, 10], opacity: [1, 0.3, 1] }}
          transition={
            reducedMotion
              ? undefined
              : { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }
        />
      </motion.svg>
    </motion.div>
  );
};
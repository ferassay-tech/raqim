import React from "react";
import { motion, MotionValue } from "motion/react";
import { useParallaxLayer } from "./MouseParallax";
import heroForeground from "../../assets/hero/hero-foreground.webp";

interface HeroForegroundProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
  delay?: number;
  reducedMotion?: boolean;
}

export const HeroForeground: React.FC<HeroForegroundProps> = ({
  x,
  y,
  delay = 0,
  reducedMotion = false,
}) => {
  const { translateX, translateY } = useParallaxLayer(x, y, reducedMotion ? 0 : 34);

  return (
    <motion.div
      className="hero-layer"
      style={{ x: translateX, y: translateY, zIndex: 6 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1, ease: "easeOut", delay }}
    >
      {/*
        This layer is now confined to a single bottom-left corner box (see
        the wrapper in HomePage.tsx) instead of spanning the full width, so
        it reads as one editorial corner detail rather than a symmetric
        two-corner band. object-position biases the crop toward the
        left-bottom cluster in the source artwork, isolating that one
        corner instead of showing both.
      */}
      <img
        src={heroForeground}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        style={{ objectPosition: "left bottom" }}
      />
    </motion.div>
  );
};
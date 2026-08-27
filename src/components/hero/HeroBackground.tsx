import React from "react";
import type { RefObject } from "react";
import { motion, MotionValue } from "motion/react";
import { useParallaxLayer } from "./MouseParallax";
import heroLandscape from "../../assets/hero/hero-landscape.webp";

interface HeroBackgroundProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
  delay?: number;
  reducedMotion?: boolean;
}

export const HeroBackground: React.FC<HeroBackgroundProps> = ({
  x,
  y,
  delay = 0,
  reducedMotion = false,
}) => {
  const { translateX, translateY } = useParallaxLayer(x, y, reducedMotion ? 0 : 6);

  return (
    <motion.div
      className="hero-layer"
      style={{ x: translateX, y: translateY, zIndex: 1 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1, ease: "easeOut", delay }}
    >
      {/* LCP candidate: eager + high priority, unlike the decorative layers below it */}
      <img
        src={heroLandscape}
        alt=""
        aria-hidden="true"
        loading="eager"
        // @ts-expect-error - fetchpriority is valid HTML but not yet in React's img typings
        fetchpriority="high"
        decoding="async"
      />
    </motion.div>
  );
};
import React from "react";
import { motion, MotionValue } from "motion/react";
import { useParallaxLayer } from "./MouseParallax";
import heroClouds from "../../assets/hero/hero-clouds.webp";

interface HeroCloudsProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
  delay?: number;
  reducedMotion?: boolean;
}

export const HeroClouds: React.FC<HeroCloudsProps> = ({
  x,
  y,
  delay = 0,
  reducedMotion = false,
}) => {
  const { translateX, translateY } = useParallaxLayer(x, y, reducedMotion ? 0 : 14);

  return (
    <motion.div
      className="hero-layer"
      style={{ x: translateX, y: translateY, zIndex: 2 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut", delay }}
    >
      {/* Inner element owns the perpetual drift, independent of the parallax transform above */}
      <motion.div
        style={{ width: "112%", height: "100%", marginLeft: "-6%" }}
        animate={reducedMotion ? undefined : { x: [0, 26, 0] }}
        transition={
          reducedMotion
            ? undefined
            : { duration: 42, repeat: Infinity, ease: "linear" }
        }
      >
        <img
          src={heroClouds}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
      </motion.div>
    </motion.div>
  );
};
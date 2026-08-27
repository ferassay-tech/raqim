import React from "react";
import { motion, MotionValue } from "motion/react";
import { useParallaxLayer } from "./MouseParallax";
import heroLight from "../../assets/hero/hero-light.png";

interface HeroLightProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
  delay?: number;
  reducedMotion?: boolean;
}

export const HeroLight: React.FC<HeroLightProps> = ({
  x,
  y,
  delay = 0,
  reducedMotion = false,
}) => {
  const { translateX, translateY } = useParallaxLayer(x, y, reducedMotion ? 0 : 10);

  return (
    <motion.div
      className="hero-layer"
      style={{ x: translateX, y: translateY, zIndex: 3, mixBlendMode: "screen" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.3, ease: "easeOut", delay }}
    >
      {/*
        "Brightness change" is simulated via opacity pulsing rather than an
        animated filter: brightness(), which is far more expensive to
        composite every frame.
      */}
      <motion.img
        src={heroLight}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        animate={reducedMotion ? undefined : { opacity: [0.55, 0.9, 0.55] }}
        transition={
          reducedMotion
            ? undefined
            : { duration: 9, repeat: Infinity, ease: "easeInOut" }
        }
      />
    </motion.div>
  );
};
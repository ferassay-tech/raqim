import React from "react";
import { motion, MotionValue } from "motion/react";
import { useParallaxLayer } from "./MouseParallax";
import heroParticles from "../../assets/hero/hero-golden-dust.png";
interface HeroParticlesProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
  delay?: number;
  reducedMotion?: boolean;
}

export const HeroParticles: React.FC<HeroParticlesProps> = ({
  x,
  y,
  delay = 0,
  reducedMotion = false,
}) => {
  const { translateX, translateY } = useParallaxLayer(x, y, reducedMotion ? 0 : 20);

  return (
    <motion.div
      className="hero-layer"
      style={{ x: translateX, y: translateY, zIndex: 4, mixBlendMode: "screen" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4, ease: "easeOut", delay }}
    >
      <motion.img
        src={heroParticles}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        animate={
          reducedMotion
            ? undefined
            : {
                y: [0, -18, -4, -22, 0],
                x: [0, 4, -3, 5, 0],
                opacity: [0.45, 0.75, 0.6, 0.8, 0.45],
              }
        }
        transition={
          reducedMotion
            ? undefined
            : { duration: 14, repeat: Infinity, ease: "easeInOut" }
        }
      />
    </motion.div>
  );
};
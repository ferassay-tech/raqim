import React from "react";
import { motion, MotionValue } from "motion/react";
import { useParallaxLayer } from "./MouseParallax";
import heroBirds from "../../assets/hero/hero-birds.webp";

interface HeroBirdsProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
  delay?: number;
  reducedMotion?: boolean;
}

/**
 * Parallax only — deliberately no flapping/flying animation per spec.
 */
export const HeroBirds: React.FC<HeroBirdsProps> = ({
  x,
  y,
  delay = 0,
  reducedMotion = false,
}) => {
  const { translateX, translateY } = useParallaxLayer(x, y, reducedMotion ? 0 : 16);

  return (
    <motion.div
      className="hero-layer"
      style={{ x: translateX, y: translateY, zIndex: 5 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut", delay }}
    >
      {/*
        This layer is now confined to a short top strip of the Hero (see the
        wrapper in HomePage.tsx), so object-fit:cover already isolates a
        wide, shallow slice. Biasing toward the very top of the source
        artwork keeps the highest, sparsest silhouettes in that slice —
        a glimpse of birds crossing high above the scene, not a feature.
      */}
      <img
        src={heroBirds}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        style={{ objectPosition: "center top" }}
      />
    </motion.div>
  );
};
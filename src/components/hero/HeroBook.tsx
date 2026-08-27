import React from "react";
import { motion, MotionValue } from "motion/react";
import { useParallaxLayer } from "./MouseParallax";
import PremiumBook3D from "../PremiumBook3D";

interface HeroBookProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
  cover: string;
  alt: string;
  delay?: number;
  reducedMotion?: boolean;
}

/**
 * PremiumBook3D already owns its own internal mouse-tilt, hover-open, and
 * floating animation — none of that is duplicated here. This wrapper only
 * adds: soft outer positional parallax ("follows mouse softly"), a very
 * subtle secondary float, and an ambient glow behind it.
 */
export const HeroBook: React.FC<HeroBookProps> = ({
  x,
  y,
  cover,
  alt,
  delay = 0,
  reducedMotion = false,
}) => {
  const { translateX, translateY } = useParallaxLayer(x, y, reducedMotion ? 0 : 12);

  return (
    <motion.div
      style={{
        position: "relative",
        zIndex: 7,
        x: translateX,
        y: translateY,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut", delay }}
    >
      {/* Ambient glow — blur is applied once (static), only opacity animates */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "70%",
          height: "60%",
          borderRadius: "50%",
          background:
            "radial-gradient(closest-side, rgba(255,224,158,0.35), rgba(255,224,158,0) 72%)",
          filter: "blur(28px)",
          zIndex: -1,
        }}
      />

      <motion.div
        animate={reducedMotion ? undefined : { y: [0, -6, 0] }}
        transition={
          reducedMotion
            ? undefined
            : { duration: 7, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <PremiumBook3D cover={cover} alt={alt} />
      </motion.div>
    </motion.div>
  );
};
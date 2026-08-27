import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { useMotionValue, useSpring, useTransform, MotionValue } from "motion/react";

/**
 * Tracks prefers-reduced-motion reactively (handles OS-level toggles
 * without requiring a page reload).
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const handleChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}

interface UseMouseParallaxOptions {
  containerRef: RefObject<HTMLElement | null>;
  disabled?: boolean;
  /** Higher = softer/slower spring response (used for "follows softly" layers) */
  softness?: "tight" | "normal" | "soft";
}

interface MouseParallaxValue {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

const SPRING_PRESETS = {
  tight: { stiffness: 90, damping: 18, mass: 0.5 },
  normal: { stiffness: 60, damping: 20, mass: 0.6 },
  soft: { stiffness: 35, damping: 22, mass: 0.9 },
};

/**
 * Normalized (-0.5..0.5) cursor position relative to the given container,
 * smoothed through a spring so every dependent layer interpolates instead
 * of jittering.
 */
export function useMouseParallax({
  containerRef,
  disabled = false,
  softness = "normal",
}: UseMouseParallaxOptions): MouseParallaxValue {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_PRESETS[softness]);
  const y = useSpring(rawY, SPRING_PRESETS[softness]);

  useEffect(() => {
    if (disabled) return;
    const node = containerRef.current;
    if (!node) return;

    const handleMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      rawX.set((e.clientX - rect.left) / rect.width - 0.5);
      rawY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handleLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    node.addEventListener("mousemove", handleMove);
    node.addEventListener("mouseleave", handleLeave);
    return () => {
      node.removeEventListener("mousemove", handleMove);
      node.removeEventListener("mouseleave", handleLeave);
    };
  }, [containerRef, disabled, rawX, rawY]);

  return { x, y };
}

/**
 * Converts shared normalized cursor motion values into a per-layer
 * translateX/Y pair scaled by depth (px). Larger depth = more movement =
 * reads as "closer" to the viewer.
 */
export function useParallaxLayer(
  x: MotionValue<number>,
  y: MotionValue<number>,
  depth: number
) {
  const translateX = useTransform(x, [-0.5, 0.5], [-depth, depth]);
  const translateY = useTransform(y, [-0.5, 0.5], [-depth * 0.6, depth * 0.6]);
  return { translateX, translateY };
}
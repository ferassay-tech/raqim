import React, { useRef } from "react";
import { useMouseParallax, useReducedMotion } from "./MouseParallax";
import { HeroBackground } from "./HeroBackground";
import { HeroClouds } from "./HeroClouds";
import { HeroLight } from "./HeroLight";
import { HeroParticles } from "./HeroParticles";
import { HeroBirds } from "./HeroBirds";
import { HeroForeground } from "./HeroForeground";
import { HeroBook } from "./HeroBook";
import { HeroContent } from "./HeroContent";
import { HeroScrollIndicator } from "./HeroScrollIndicator";
import "./hero.css";

export interface HeroSceneProps {
  bookCover: string;
  bookAlt: string;
  onPrimaryCta?: () => void;
  onSecondaryCta?: () => void;
}

/**
 * Cinematic homepage Hero. Self-contained: does not touch routing,
 * checkout, payments, navbar, or footer. Only reads bookCover/bookAlt
 * from whatever the homepage already passes in.
 */
export const HeroScene: React.FC<HeroSceneProps> = ({
  bookCover,
  bookAlt,
  onPrimaryCta,
  onSecondaryCta,
}) => {
  const sceneRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const { x, y } = useMouseParallax({
    containerRef: sceneRef,
    disabled: reducedMotion,
    softness: "normal",
  });

  return (
    <section
      ref={sceneRef}
      className="hero-scene"
      aria-label="مرافئ — كوني هاجر"
    >
      <HeroBackground x={x} y={y} delay={0} reducedMotion={reducedMotion} />
      <HeroClouds x={x} y={y} delay={0.15} reducedMotion={reducedMotion} />
      <HeroLight x={x} y={y} delay={0.25} reducedMotion={reducedMotion} />
      <HeroParticles x={x} y={y} delay={0.35} reducedMotion={reducedMotion} />
      <HeroBirds x={x} y={y} delay={0.3} reducedMotion={reducedMotion} />
      <HeroForeground x={x} y={y} delay={0.45} reducedMotion={reducedMotion} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 7,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.75rem",
          padding: "2rem 1rem",
        }}
      >
        <HeroBook
          x={x}
          y={y}
          cover={bookCover}
          alt={bookAlt}
          delay={0.6}
          reducedMotion={reducedMotion}
        />

        <HeroContent
          headlineDelay={0.85}
          descriptionDelay={1.0}
          ctaDelay={1.15}
          onPrimaryCta={onPrimaryCta}
          onSecondaryCta={onSecondaryCta}
        />
      </div>

      <HeroScrollIndicator delay={1.4} reducedMotion={reducedMotion} />
    </section>
  );
};

export default HeroScene;
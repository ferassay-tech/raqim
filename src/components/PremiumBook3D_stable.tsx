import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

interface PremiumBook3DProps {
  cover: string;
  alt: string;
}

export default function PremiumBook3D({
  cover,
  alt,
}: PremiumBook3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, {
    stiffness: 180,
    damping: 20,
    mass: 0.8,
  });

  const springY = useSpring(mouseY, {
    stiffness: 180,
    damping: 20,
    mass: 0.8,
  });

  const rotateY = useTransform(springX, [-150, 150], [-14, 14]);
  const rotateX = useTransform(springY, [-150, 150], [10, -10]);

  function handleMouseMove(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect) return;

    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-center"
      style={{
        width: 380,
        height: 520,
        perspective: 1800,
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
              >
        {/* Book */}
        <div
          style={{
            position: "relative",
            width: 320,
            height: 450,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Shadow */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 22,
              background: "rgba(0,0,0,.18)",
              filter: "blur(35px)",
              transform: "translateZ(-80px) translateY(26px) scale(.95)",
            }}
          />

          {/* Page Stack */}
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 22,
                background:
                  "linear-gradient(to right,#fffefc,#f8f4ec,#efe4d2)",
                border: "1px solid rgba(0,0,0,.03)",
                transform: `translateZ(${-18 + i}px)`,
              }}
            />
          ))}

          {/* Book Spine */}
          <div
            style={{
              position: "absolute",
              left: -18,
              top: 10,
              bottom: 10,
              width: 18,
              borderRadius: "12px 0 0 12px",
              background:
                "linear-gradient(to bottom,#b891c8,#8d5ea8,#6e4688)",
              transform: "rotateY(90deg) translateZ(9px)",
              transformOrigin: "right center",
            }}
          />

          {/* Front Cover */}
          <motion.div
            whileHover={{
              rotateY: -18,
            }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 18,
            }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 22,
              overflow: "hidden",
              transformStyle: "preserve-3d",
              transformOrigin: "left center",
              transform: "translateZ(22px)",
              boxShadow:
                "0 30px 70px rgba(0,0,0,.28)",
            }}
          >
            <img
              src={cover}
              alt={alt}
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                userSelect: "none",
              }}
            />

            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(120deg,rgba(255,255,255,.35),transparent 40%,transparent 60%,rgba(255,255,255,.08))",
                mixBlendMode: "screen",
              }}
            />
          </motion.div>
                    {/* Right Edge */}
          <div
            style={{
              position: "absolute",
              top: 10,
              right: -10,
              bottom: 10,
              width: 10,
              background:
                "linear-gradient(to bottom,#f7f2e8,#e7dcc8,#d8cab3)",
              transform: "rotateY(90deg) translateZ(5px)",
              transformOrigin: "left center",
            }}
          />

          {/* Bottom Edge */}
          <div
            style={{
              position: "absolute",
              left: 10,
              right: 10,
              bottom: -10,
              height: 10,
              background:
                "linear-gradient(to right,#efe5d4,#ddd0bb,#cdbda5)",
              transform: "rotateX(-90deg) translateZ(5px)",
              transformOrigin: "top center",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
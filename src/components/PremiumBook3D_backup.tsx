import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";

interface PremiumBook3DProps {
  cover: string;
  alt: string;
}

export default function PremiumBook3D({
  cover,
  alt,
}: PremiumBook3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bookOpen, setBookOpen] = useState(false);

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
  onMouseEnter={() => setBookOpen(true)}
  onMouseLeave={() => setBookOpen(false)}
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

         {/* Back Cover */}
<div
  style={{
    position: "absolute",
    inset: 0,
    borderRadius: 22,
    overflow: "hidden",
    transform: "translateZ(-8px)",
    boxShadow: "0 18px 40px rgba(0,0,0,.18)",
  }}
>
  <img
    src="/books/kuni-hajar/back.webp"
    alt="Back Cover"
    draggable={false}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
    }}
  />
</div>

{/* Pages */}
{[
  "/books/kuni-hajar/page-05.webp",
  "/books/kuni-hajar/page-04.webp",
  "/books/kuni-hajar/page-03.webp",
  "/books/kuni-hajar/page-02.webp",
  "/books/kuni-hajar/page-01.webp",
].map((page, index) => (
  <motion.div
    key={page}
    animate={{
      rotateY: bookOpen && index === 4 ? -160 : 0,
    }}
    transition={{
      type: "spring",
      stiffness: 140,
      damping: 24,
    }}
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: 22,
      overflow: "hidden",
      transformOrigin: "left center",
      transform: `translateZ(${4 - index}px)`,
      boxShadow: "0 2px 8px rgba(0,0,0,.08)",
      background: "#fff",
      zIndex: 10 + index,
      backfaceVisibility: "hidden",
    }}
  >
    <img
      src={page}
      draggable={false}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  </motion.div>
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
            animate={{
  rotateY: bookOpen ? -22 : 0,
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
              transform: "translateZ(40px)",
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
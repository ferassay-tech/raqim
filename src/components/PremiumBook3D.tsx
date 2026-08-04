import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import HTMLFlipBook from "react-pageflip";
import "./PremiumBook3D.pageflip.css";
import { useLanguage } from "../context/LanguageContext";

// react-pageflip's own types expose the ref as `any`; this narrows it to
// just the handful of PageFlip methods we actually call.
interface PageFlipController {
  flipNext: (corner?: "top" | "bottom") => void;
  flipPrev: (corner?: "top" | "bottom") => void;
  getBoundsRect: () => unknown;
}
interface FlipBookHandle {
  pageFlip: () => PageFlipController;
}

interface PremiumBook3DProps {
  cover: string;
  alt: string;
  /** Optional: real preview-page images. When provided, the book becomes a
   * genuine flip-through preview (larger open angle, page-by-page
   * navigation) instead of the decorative "cracked open" peek used
   * everywhere this component doesn't pass preview pages (e.g. the Hero). */
  previewPages?: string[];
  /** Optional: shown on the back cover once every preview page is turned. */
  backCover?: string;
}

const WIDTH = 380;
const HEIGHT = 535;
const THICKNESS = 32;
const CONTAINER_WIDTH = WIDTH + THICKNESS + 60;
const CONTAINER_HEIGHT = HEIGHT + 80;
const SHADOW_WIDTH = WIDTH * 0.72;
const SHADOW_HEIGHT = HEIGHT * 0.14;
const SHADOW_LEFT = (CONTAINER_WIDTH - SHADOW_WIDTH) / 2;

// Decorative peek angle for the legacy cover (e.g. Hero, no real preview
// pages) — deliberately small and shallow, just enough to read as "cracked
// open." The real preview's cover is a genuine page-flip page now, with no
// angle constant of its own; the engine owns its rotation entirely.
const COVER_ANGLE = -19;
const PAGE1_ANGLE = COVER_ANGLE * 0.7;
const PAGE2_ANGLE = COVER_ANGLE * 0.35;
// How long one page turn takes inside the page-flip engine (ms).
const FLIP_DURATION = 600;
// Width of the invisible left/right tap zones used to turn pages — narrow
// and flush with the book's own outer edges. Deliberately slim: with
// useMouseEvents enabled, the page-flip engine treats a click or drag
// anywhere on the page itself as a valid flip/drag gesture (there's no
// "corners only" restriction unless disableFlipByClick is set), so a wide
// button strip here would sit on top of and swallow most of that native
// interaction before it ever reaches the engine. This only needs to be
// wide enough to be a comfortable tap target, not to cover the page.
const EDGE_ZONE_WIDTH = 36;

const STACK_PAGES = [
  "#fbf7ee",
  "#f7f1e2",
  "#f4ecd8",
  "#f1e9d6",
  "#ede4cc",
  "#e9dfc4",
  "#e5dabc",
  "#e0d4b2",
];

// Small fixed per-sheet jitter — deterministic, not random — so the fixed
// paper stack reads as naturally uneven compressed paper instead of a
// perfectly uniform mathematical progression.
const PAGE_JITTER = [0.35, -0.2, 0.45, -0.3, 0.2, -0.4, 0.3, -0.15];

const PremiumBook3D: React.FC<PremiumBook3DProps> = ({
  cover,
  alt,
  previewPages,
  backCover,
}) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<FlipBookHandle>(null);
  const hasPreview = Boolean(previewPages && previewPages.length > 0);
  const pageCount = hasPreview ? previewPages!.length : 0;

  // Legacy mode (no previewPages, e.g. Hero) still only ever needs an
  // open/closed cover — isOpen alone reproduces that exactly. Once true, it
  // never goes false again during this mount: opening a hardcover doesn't
  // undo itself while you're looking at it. Only a fresh mount starts closed.
  const [isOpen, setIsOpen] = useState(false);
  // Legacy (!hasPreview, e.g. Hero) keeps its original hover-driven peek:
  // open shortly after the cursor arrives, close again after it's been gone
  // a while. That behavior predates and is unrelated to the "never closes
  // again" rule below, which only applies to the real page-flip preview.
  const openTimer = useRef<number | null>(null);
  const resetTimer = useRef<number | null>(null);

  const isMobile =
  typeof window !== "undefined" &&
  window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  // Only the legacy decorative peek (no real preview pages, e.g. Hero)
  // still opens via this click handler and its own custom rotation. The
  // real preview's cover is just page 0 of the flipbook now — clicking or
  // dragging it is the engine's own native interaction, exactly like every
  // other page, so this deliberately does nothing when hasPreview is true.
  const openBook = () => {
    if (hasPreview || isOpen) return;
    setIsOpen(true);
  };

  // Thin wrappers over the page-flip engine's own ref API — all page-turn
  // animation, physics and interaction now live inside the engine itself.
  const advancePage = () => {
    bookRef.current?.pageFlip().flipNext();
  };
  const retreatPage = () => {
    bookRef.current?.pageFlip().flipPrev();
  };

  // Shared input bus for "which way is this object tilting" — desktop
  // writes to it from cursor position, mobile/tablet writes to it from the
  // gyroscope, but only one of the two is ever active for a given device
  // (the desktop mousemove handler is already disabled on mobile below), so
  // every tilt-driven visual downstream (shadow, gloss, sheen, rotation,
  // float) automatically responds correctly regardless of input source
  // without needing a second parallel pipeline.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Heavier mass with stiffness/damping scaled to preserve the same ~0.83
  // damping ratio (so the settle stays just as restrained, non-bouncy) while
  // dropping the natural frequency ~30% — the book now visibly lags behind
  // the cursor and takes longer to stop, like an object with real mass
  // rather than a UI layer tracking a pointer.
  const TILT_SPRING = { stiffness: 110, damping: 22, mass: 1.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), TILT_SPRING);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), TILT_SPRING);

  const shadowX = useTransform(rotateY, [-14, 14], [18, -18]);
  const shadowY = useTransform(rotateX, [-10, 10], [-14, 14]);

  // Shadow softens, grows and lightens with tilt magnitude — approximates
  // the book lifting slightly at its tilted edge instead of a shadow that
  // only slides beneath a perfectly flat surface.
  const tiltMagnitude = useTransform(
    [rotateX, rotateY],
    ([rx, ry]: number[]) => Math.min(1, (Math.abs(rx) + Math.abs(ry)) / 24)
  );

  // Small parallax drift + depth, derived from the already-spring-smoothed
  // rotation/tilt values above rather than raw input — it inherits the same
  // settle feel for free instead of needing its own spring. Deliberately
  // subtle: this is a floating object, not a swaying one.
  const floatX = useTransform(rotateY, [-14, 14], [-5, 5]);
  const floatY = useTransform(rotateX, [-10, 10], [4, -4]);
  const floatZ = useTransform(tiltMagnitude, [0, 1], [0, 8]);
  const shadowScale = useTransform(tiltMagnitude, [0, 1], [1, 1.15]);
  const shadowOpacity = useTransform(tiltMagnitude, [0, 1], [1, 0.7]);
  const shadowBlurPx = useTransform(tiltMagnitude, [0, 1], [16, 26]);
  const shadowBlur = useMotionTemplate`blur(${shadowBlurPx}px)`;

  const lightXRaw = useTransform(mouseX, [-0.5, 0.5], [25, 75]);
  const lightYRaw = useTransform(mouseY, [-0.5, 0.5], [20, 80]);
  const REFLECTION_SPRING = { stiffness: 100, damping: 22, mass: 0.8 };
  const lightX = useSpring(lightXRaw, REFLECTION_SPRING);
  const lightY = useSpring(lightYRaw, REFLECTION_SPRING);
  const reflectionPosition = useMotionTemplate`${lightX}% ${lightY}%`;
  // Specular glint reads brighter at a sharper viewing angle, like a real gloss laminate.
  const reflectionIntensity = useTransform(tiltMagnitude, [0, 1], [0.5, 1]);

  // Second, broader sheen — tied to tilt (not raw cursor) so it sweeps the
  // cover more slowly than the glint above, like light rolling across a
  // laminated hardcover as it turns.
  const sheenX = useTransform(rotateY, [-14, 14], [30, 70]);
  const sheenY = useTransform(rotateX, [-10, 10], [70, 30]);
  const sheenPosition = useMotionTemplate`${sheenX}% ${sheenY}%`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(relX);
    mouseY.set(relY);
  };

  // Device tilt is the mobile/tablet equivalent of the desktop cursor —
  // feeding the exact same mouseX/mouseY bus the desktop mousemove handler
  // uses (which is already disabled on mobile) means every tilt-driven
  // visual (rotation, shadow, gloss, float) responds to it automatically,
  // with no separate pipeline to keep in sync. This only ever reads device
  // orientation and writes to those two motion values — it never touches
  // PageFlip, so page turning stays entirely the engine's own responsibility.
  useEffect(() => {
    if (!isMobile || reducedMotion) return;
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return;

    let active = true;
    // Calibrated against wherever the device happens to be held when
    // tracking starts, not an assumed "flat" or "upright" angle — people
    // hold phones at very different resting angles, so only the DELTA from
    // that first reading is used, exactly like the mouse's own delta-from-
    // center approach.
    let baseline: { beta: number; gamma: number } | null = null;
    // Raw beta/gamma are noisy frame to frame — especially on Android,
    // whose fused accelerometer+magnetometer orientation pipeline is
    // typically jumpier than iOS's — so an exponential moving average
    // absorbs that noise before it ever reaches the motion values, rather
    // than letting the spring chase a constantly-jittering target.
    let smoothedBeta: number | null = null;
    let smoothedGamma: number | null = null;
    const SMOOTHING = 0.15;
    let latestBeta = 0;
    let latestGamma = 0;
    let rafId: number | null = null;

    const applyOrientation = () => {
      rafId = null;
      if (!active) return;
      if (baseline === null) baseline = { beta: latestBeta, gamma: latestGamma };
      smoothedBeta =
        smoothedBeta === null ? latestBeta : smoothedBeta + (latestBeta - smoothedBeta) * SMOOTHING;
      smoothedGamma =
        smoothedGamma === null
          ? latestGamma
          : smoothedGamma + (latestGamma - smoothedGamma) * SMOOTHING;

      // Scaled to a smaller sub-range than the desktop cursor's full
      // -0.5..0.5 (which maps to this component's ±10°/±14° desktop tilt)
      // so the same shared rotation mapping tops out around 6-8° here
      // instead — gentle device tilt should read as floating, not as
      // aggressively rotating the object.
      const normBeta = Math.max(-0.25, Math.min(0.25, (smoothedBeta - baseline.beta) / 100));
      const normGamma = Math.max(-0.25, Math.min(0.25, (smoothedGamma - baseline.gamma) / 100));
      mouseY.set(normBeta);
      mouseX.set(normGamma);
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!active) return;
      latestBeta = e.beta ?? 0;
      latestGamma = e.gamma ?? 0;
      // Sensors can dispatch far more often than the screen repaints —
      // coalesce to at most one applied update per animation frame instead
      // of pushing every single raw event straight through, which is its
      // own separate source of visible stutter.
      if (rafId === null) {
        rafId = requestAnimationFrame(applyOrientation);
      }
    };

    const attach = () => window.addEventListener("deviceorientation", handleOrientation);
    const cleanup = () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };

    const RequestableDeviceOrientationEvent = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };

    if (typeof RequestableDeviceOrientationEvent.requestPermission === "function") {
      // iOS requires permission to be requested from a genuine user
      // gesture — it doesn't have to be any particular gesture, just some
      // gesture, so this only ever fires the request itself.
      const requestPermission = () => {
        RequestableDeviceOrientationEvent.requestPermission?.()
          .then((state) => {
            if (state === "granted") attach();
          })
          .catch(() => {
            /* permission denied or unsupported — floating simply stays off */
          });
      };

      if (hasPreview) {
        // Book Details page — the very first touch anywhere on the page,
        // including the book itself, requests permission, on "touchstart"
        // rather than "click" so it fires the instant a finger lands.
        // Falls back to "click" for pointer/mouse-based testing (e.g.
        // desktop devtools device emulation), which never fires
        // "touchstart". This variant is unrelated to the Hero branch below
        // and must not be touched by changes there.
        const requestOnFirstTouch = () => {
          window.removeEventListener("touchstart", requestOnFirstTouch);
          window.removeEventListener("click", requestOnFirstTouch);
          requestPermission();
        };
        window.addEventListener("touchstart", requestOnFirstTouch, { passive: true });
        window.addEventListener("click", requestOnFirstTouch);
        return () => {
          active = false;
          window.removeEventListener("touchstart", requestOnFirstTouch);
          window.removeEventListener("click", requestOnFirstTouch);
          cleanup();
        };
      }

      // Hero only: the book's own tap must never be the gesture that
      // enables this (it already has its own click handler for the
      // decorative peek, and a permission prompt appearing at the same
      // moment the book opens reads as broken/coupled). iOS still needs
      // *some* gesture, so this waits for the first click that does NOT
      // originate from inside the book itself — no {once:true}, since a
      // click on the book must be ignored, not consumed.
      const requestOnFirstOutsideTap = (e: MouseEvent) => {
        if (containerRef.current?.contains(e.target as Node)) return;
        window.removeEventListener("click", requestOnFirstOutsideTap);
        requestPermission();
      };
      window.addEventListener("click", requestOnFirstOutsideTap);
      return () => {
        active = false;
        window.removeEventListener("click", requestOnFirstOutsideTap);
        cleanup();
      };
    }

    // No permission prompt exists on this platform, so this should already
    // receive events immediately with zero interaction — attach() below
    // runs unconditionally, right on mount. The extra listener is a
    // defensive, zero-cost safety net only: re-adding the identical
    // handler reference to the same event is a documented no-op if it's
    // already registered, so this changes nothing when the immediate
    // attach already works, and closes the gap if a given browser/OS
    // configuration silently withholds sensor dispatch until the page has
    // received any engagement at all — never anything specific to the book.
    attach();
    const reattachOnFirstTouch = () => {
      window.removeEventListener("touchstart", reattachOnFirstTouch);
      attach();
    };
    window.addEventListener("touchstart", reattachOnFirstTouch, {
      once: true,
      passive: true,
    });
    return () => {
      active = false;
      window.removeEventListener("touchstart", reattachOnFirstTouch);
      cleanup();
    };
  }, [isMobile, reducedMotion, mouseX, mouseY, hasPreview]);

  // Mobile can't hover, so it gets a one-time, single slow reveal instead:
  // once the book is meaningfully in view, open the cover just enough to
  // show page 1 — a single deliberate motion, not a rapid multi-page
  // auto-play (which read as a bug rather than a premium animation). Runs
  // once per browser session per book (keyed off the cover image, so this
  // stays generic for future books without needing an extra id prop).
  useEffect(() => {
    if (!hasPreview || !isMobile || reducedMotion) return;
    const node = containerRef.current;
    if (!node) return;

    const storageKey = `raqim_preview_demo:${cover}`;
    try {
      if (sessionStorage.getItem(storageKey)) return;
    } catch {
      /* ignore storage access errors */
    }

    let cancelled = false;
    const timers: number[] = [];
    const schedule = (fn: () => void, delay: number) => {
      timers.push(window.setTimeout(() => !cancelled && fn(), delay));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        try {
          sessionStorage.setItem(storageKey, "1");
        } catch {
          /* ignore quota errors */
        }

        // The cover is just page 0 now, so the single flipNext() both opens
        // it and reveals previewPages[0] in one motion. A generous pause
        // before it starts (the book has to actually settle into view and
        // read as "arrived," not auto-play the instant it's technically
        // intersecting) plus a single flip — no second or third page turn
        // follows.
        if (pageCount >= 1) schedule(() => bookRef.current?.pageFlip().flipNext(), 700);
      },
      { threshold: 0.45 }
    );
    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
      timers.forEach((t) => clearTimeout(t));
    };
  }, [hasPreview, isMobile, reducedMotion, cover, pageCount]);

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);

    if (hasPreview) return; // never auto-closes once opened

    // Legacy Hero peek only: leaving the cursor for a moment shouldn't slam
    // it shut immediately, but it should still relax closed if the user
    // doesn't come back for a while.
    if (openTimer.current) clearTimeout(openTimer.current);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 5000);
  };

  return (
    <div
      ref={containerRef}
      onClick={openBook}
      onMouseMove={isMobile || reducedMotion ? undefined : handleMouseMove}
      onMouseEnter={
        isMobile || reducedMotion
          ? undefined
          : () => {
              if (hasPreview) return; // click-only; hover never opens it

              if (resetTimer.current) {
                clearTimeout(resetTimer.current);
                resetTimer.current = null;
              }
              if (openTimer.current) clearTimeout(openTimer.current);
              openTimer.current = window.setTimeout(() => {
                setIsOpen(true);
              }, 250);
            }
      }
      onMouseLeave={isMobile || reducedMotion ? undefined : handleMouseLeave}
      style={{
        width: CONTAINER_WIDTH,
        height: CONTAINER_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "1800px",
        position: "relative",
        cursor: "pointer",
      }}
    >
      {/* Floating drop shadow */}
      <motion.div
        style={{
          position: "absolute",
          width: SHADOW_WIDTH,
          height: SHADOW_HEIGHT,
          left: SHADOW_LEFT,
          bottom: 8,
          x: shadowX,
          y: shadowY,
          scale: shadowScale,
          opacity: shadowOpacity,
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0) 75%)",
          filter: shadowBlur,
          borderRadius: "50%",
          zIndex: 0,
        }}
      />

      <motion.div
        style={{
          width: WIDTH,
          height: HEIGHT,
          position: "relative",
          transformStyle: "preserve-3d",
          rotateX,
          rotateY,
          x: floatX,
          y: floatY,
          z: floatZ,
          zIndex: 1,
        }}
        transition={{ default: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
        whileHover={
          reducedMotion
            ? undefined
            : { scale: 1.03, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
        }
      >
        {/* Back cover / fixed book body */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateZ(-${THICKNESS / 2}px)`,
            borderRadius: "3px 8px 8px 3px",
            overflow: "hidden",
            background: backCover
              ? undefined
              : "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.32) 6px, rgba(0,0,0,0.42) 8px, rgba(255,255,255,0.08) 10px, transparent 14px, transparent 100%), linear-gradient(135deg, #2a1c12 0%, #1b120b 50%, #2a1c12 100%)",
            boxShadow:
              "inset 0 0 34px rgba(0,0,0,0.6), inset -3px -3px 4px rgba(0,0,0,0.25), inset 0 3px 4px rgba(0,0,0,0.25)",
          }}
        >
          {backCover && (
            <img
              src={backCover}
              alt={`${alt}${t("book3d.backCoverAltSuffix")}`}
              draggable={false}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          )}
        </div>

        {/* Spine */}
        <div
          style={{
            position: "absolute",
            left: -THICKNESS / 2,
            top: 0,
            width: THICKNESS,
            height: HEIGHT,
            transformOrigin: "right center",
            transform: "rotateY(-90deg)",
            background:
              "linear-gradient(90deg, #0d0805 0%, #1b120b 12%, #2e1e12 30%, #43301c 48%, #3a2718 62%, #1f140c 85%, #0d0805 100%)",
            boxShadow:
              "inset -4px 0 12px rgba(0,0,0,0.5), inset 4px 0 12px rgba(0,0,0,0.5)",
            borderRadius: "3px 0 0 3px",
          }}
        />

        {/* Right page-edge stack */}
        <div
          style={{
            position: "absolute",
            right: -THICKNESS / 2,
            top: 3,
            width: THICKNESS,
            height: HEIGHT - 6,
            transformOrigin: "left center",
            transform: "rotateY(90deg)",
            // Irregular, low-alpha tonal drift layered over the fine sheet
            // repeat below — breaks the perfectly periodic look so the
            // fore-edge reads as compressed paper fiber, not a printed strip.
            background:
              "linear-gradient(178deg, rgba(0,0,0,0.035) 0%, rgba(255,255,255,0.025) 9%, rgba(0,0,0,0.02) 17%, rgba(255,255,255,0.03) 26%, rgba(0,0,0,0.025) 38%, rgba(255,255,255,0.02) 51%, rgba(0,0,0,0.03) 64%, rgba(255,255,255,0.025) 76%, rgba(0,0,0,0.02) 88%, rgba(255,255,255,0.03) 100%), repeating-linear-gradient(180deg, #f7f1e3 0px, #f2ead9 1.2px, #ede3cf 2.1px, #f2ead9 3px, #f7f1e3 4.4px)",
            boxShadow: "inset 0 0 9px rgba(0,0,0,0.25)",
          }}
        />

        {/* Bottom page-edge stack */}
        <div
          style={{
            position: "absolute",
            left: 3,
            bottom: -THICKNESS / 2,
            width: WIDTH - 6,
            height: THICKNESS,
            transformOrigin: "top center",
            transform: "rotateX(-90deg)",
            background:
              "repeating-linear-gradient(90deg, #f7f1e3 0px, #f2ead9 1.2px, #ede3cf 2.1px, #f2ead9 3px, #f7f1e3 4.4px)",
            boxShadow: "inset 0 0 9px rgba(0,0,0,0.25)",
          }}
        />

        {/* Fixed interior paper stack — decorative filler for the legacy peek
            only. When real preview pages exist, they occupy this same depth
            range themselves; rendering both caused the two to collide in
            z-order, with this opaque filler sitting in front of and hiding
            the later real page images (the pages-4-and-5 bug). */}
        {!hasPreview && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
          }}
        >
          {STACK_PAGES.map((color, i) => {
            const depthStep = (THICKNESS - 8) / (STACK_PAGES.length + 2);
            // Starts one page-step below the innermost moving sheet (at
            // THICKNESS/2 - 7) so the fixed stack picks up where it leaves
            // off, instead of leaving a hollow gap in the page block.
            const zPos = THICKNESS / 2 - 7 - (i + 1) * depthStep;
            const insetBase = 2.5 + i * 0.5;
            const jitter = PAGE_JITTER[i % PAGE_JITTER.length];
            const shadowStrength = (0.14 + Math.abs(jitter) * 0.06).toFixed(2);
            // Ambient-occlusion-style darkening that ramps smoothly with
            // depth (shallow near the moving sheets, deepest near the back
            // cover) instead of identical flat shading on every layer — so
            // the stack reads as one continuously shaded mass rather than a
            // handful of equally-lit, individually visible sheets.
            const occlusion = i / (STACK_PAGES.length - 1);
            const occlusionAlpha = (0.04 + occlusion * 0.18).toFixed(2);
            const occlusionBlur = (6 + occlusion * 6).toFixed(1);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: insetBase + jitter,
                  // Spine side (left): heavily damped — pages read as pressed
                  // tight and bound. Fore-edge (right): amplified — the same
                  // jitter values now read as the freer, unbound edge.
                  left: insetBase - jitter * 0.15,
                  right: insetBase + jitter * 0.9,
                  bottom: insetBase - jitter,
                  transform: `translateZ(${zPos}px)`,
                  background: `linear-gradient(135deg, ${color} 0%, ${color} 60%, #e0d4b2 100%)`,
                  borderRadius: "1px 6px 6px 1px",
                  boxShadow: `0 1px 2px rgba(0,0,0,${shadowStrength}), inset 0 0 ${occlusionBlur}px rgba(0,0,0,${occlusionAlpha})`,
                }}
              />
            );
          })}
        </div>
        )}

        {!hasPreview && (
          <>
            {/* Second moving sheet — subtle motion, mostly fixed (legacy decorative peek only) */}
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                transformOrigin: "left center",
                z: THICKNESS / 2 - 5,
                background:
                  "linear-gradient(135deg, #fdfaf1 0%, #f8f2df 55%, #efe6cc 100%)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
              animate={{
                rotateY: isOpen ? PAGE2_ANGLE : 0,
                borderRadius: isOpen
                  ? "2px 18px 18px 2px"
                  : "2px 6px 6px 2px",
              }}
              transition={{ type: "spring", stiffness: 130, damping: 18 }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(90deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 25%)",
                  pointerEvents: "none",
                }}
              />
            </motion.div>

            {/* First moving sheet — closest to the cover */}
            <motion.div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                transformOrigin: "left center",
                z: THICKNESS / 2 - 7,
               background:
               "linear-gradient(135deg, #fffdf7 0%, #fbf6e8 55%, #f2ead3 100%)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              }}
              animate={{
                rotateY: isOpen ? PAGE1_ANGLE : 0,
                borderRadius: isOpen
                  ? "2px 26px 26px 2px"
                  : "2px 7px 7px 2px",
              }}
              transition={{ type: "spring", stiffness: 130, damping: 17 }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: WIDTH - 2,
                  background:
                    "linear-gradient(90deg, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0) 30%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                   "linear-gradient(90deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 12%)",
                  pointerEvents: "none",
                }}
              />
            </motion.div>
          </>
        )}

        {/* The whole book — cover included — is now the page-flip engine's
            responsibility. showCover marks the first and last children as
            rigid "hard" pages shown in single-page mode at rest, which is
            exactly the closed-cover state: page 0 IS the cover, so opening
            it, turning through it, and turning back to it all go through
            the engine's own curl/bend/shadow physics, never a custom
            animation of ours. Mounted unconditionally (not gated on isOpen
            — that state no longer applies here at all, only to the legacy
            peek below) so the closed cover itself is the engine's own
            rendering from the very first paint. */}
        {hasPreview && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "left center",
              // Flush with where the old custom front cover used to sit —
              // the engine's page 0 now occupies that same role and depth.
              transform: `translateZ(${THICKNESS / 2}px)`,
              overflow: "hidden",
              borderRadius: "2px 18px 18px 2px",
            }}
          >
            <HTMLFlipBook
              ref={bookRef}
              className=""
              style={{}}
              width={WIDTH}
              height={HEIGHT}
              size="fixed"
              minWidth={WIDTH}
              maxWidth={WIDTH}
              minHeight={HEIGHT}
              maxHeight={HEIGHT}
              startPage={0}
              startZIndex={0}
              autoSize={false}
              usePortrait={true}
              showCover={true}
              drawShadow={true}
              maxShadowOpacity={0.5}
              flippingTime={FLIP_DURATION}
              // Preserving natural drag/corner-grab interaction, per the
              // engine's own strength — only disable this if tilt is
              // proven to make it unreliable in practice.
              useMouseEvents={true}
              clickEventForward={true}
              showPageCorners={true}
              disableFlipByClick={false}
              swipeDistance={30}
              // True (the default) is what lets a touch on the book
              // capture the drag for page-turning instead of scrolling
              // the page underneath it — required for mobile dragging.
              mobileScrollSupport={true}
              // The engine already computes its own bounds shortly after
              // init internally, but this makes that guaranteed rather
              // than incidental: by the time a user can actually hover the
              // cover, its size/position measurement is already done, not
              // deferred to the first interaction.
              onInit={() => {
                bookRef.current?.pageFlip().getBoundsRect();
              }}
            >
              {/* Page 0 — the front cover itself, handled entirely by the
                  engine (showCover marks it "hard" automatically). */}
              <div className="page" key="cover" style={{ width: "100%", height: "100%" }}>
                <img
                  src={cover}
                  alt={alt}
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                />
              </div>
              {previewPages!.map((src, i) => (
                <div className="page" key={src} style={{ width: "100%", height: "100%" }}>
                  <img
                    src={src}
                    alt={`${alt}${t("book3d.previewPageAltPrefix")}${i + 1}`}
                    draggable={false}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  />
                </div>
              ))}
              {backCover && (
                <div className="page" data-density="hard" key="back-cover" style={{ width: "100%", height: "100%" }}>
                  <img
                    src={backCover}
                    alt={`${alt}${t("book3d.backCoverAltSuffix")}`}
                    draggable={false}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  />
                </div>
              )}
            </HTMLFlipBook>
          </div>
        )}

        {/* Front cover — legacy decorative peek only (e.g. Hero). The real
            preview's cover is handled entirely by the flipbook above; this
            hand-animated version never renders for hasPreview anymore. */}
        {!hasPreview && (
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            // Once the cover rotates past 90°, this stops the browser from
            // rendering the same face mirrored as if seen from behind — it
            // hides instead, correctly revealing whatever is now behind it.
            backfaceVisibility: "hidden",
            z: THICKNESS / 2,
            overflow: "hidden",
            boxShadow:
            "0 8px 18px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.04), inset -3px -3px 4px rgba(0,0,0,0.22), inset 0 3px 4px rgba(0,0,0,0.22)",

          }}
          animate={{
            rotateY: isOpen ? COVER_ANGLE : 0,
            borderRadius: isOpen
              ? "3px 36px 36px 3px"
              : "3px 8px 8px 3px",
          }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          role="img"
          aria-label={alt}
        >
          {/* Reactive glossy reflection */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 35%, rgba(255,255,255,0) 60%)",
              backgroundSize: "200% 200%",
              backgroundPosition: reflectionPosition,
              opacity: reflectionIntensity,
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
          <img
  src={cover}
  alt={alt}
  draggable={false}
  style={{
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    pointerEvents: "none",
    userSelect: "none",
  }}
/>
          {/* Moving diagonal sheen — tied to tilt, sweeps slower than the glint above */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
             "linear-gradient(115deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.05) 20%, rgba(255,255,255,0) 42%, rgba(255,255,255,0) 65%, rgba(255,255,255,0.07) 85%, rgba(255,255,255,0.07) 100%)",
              backgroundSize: "220% 220%",
              backgroundPosition: sheenPosition,
              mixBlendMode: "overlay",
              pointerEvents: "none",
            }}
          />
          {/* Spine-side hinge groove — the crease where a case-bound board meets the spine */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 12,
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.30) 5px, rgba(0,0,0,0.40) 7px, rgba(255,255,255,0.10) 9px, rgba(0,0,0,0) 12px)",
              pointerEvents: "none",
            }}
          />
        </motion.div>
        )}
      </motion.div>

      {hasPreview && (
        <>
          {/* Left outer edge — previous page. Tap/click only; no drag. */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              retreatPage();
            }}
            aria-label={t("book3d.previousPage")}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: EDGE_ZONE_WIDTH,
              height: HEIGHT,
              transform: `translate(calc(-50% - ${WIDTH / 2 - EDGE_ZONE_WIDTH / 2}px), -50%)`,
              zIndex: 2,
              cursor: "pointer",
              background: "transparent",
              border: "none",
              padding: 0,
            }}
          />
          {/* Right outer edge — next page */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              advancePage();
            }}
            aria-label={t("book3d.nextPage")}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: EDGE_ZONE_WIDTH,
              height: HEIGHT,
              transform: `translate(calc(-50% + ${WIDTH / 2 - EDGE_ZONE_WIDTH / 2}px), -50%)`,
              zIndex: 2,
              cursor: "pointer",
              background: "transparent",
              border: "none",
              padding: 0,
            }}
          />
        </>
      )}
    </div>
  );
};

export default PremiumBook3D;
/** Mirrors the CSS `--ease-arrival` token (src/index.css) — Framer/Motion's
 * `ease` option accepts the same four cubic-bezier control points as an
 * array. Shared by both the public and admin sides; only the easing curve
 * is unified here — each consumer keeps its own existing duration. */
export const EASE_ARRIVAL = [0.16, 1, 0.3, 1] as const;

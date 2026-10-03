import { A } from "./assets";
import { createFeather } from "./feather";

/**
 * Scroll-journey engine: an imperative port of the prototype's main.js.
 * React renders the markup (Journey.tsx); this drives it frame by frame —
 * scroll-scrubbed videos, sharp-still handovers, parallax, dust, grain.
 * Everything is queried inside `root`, never on `document`, and destroy()
 * undoes every listener, timer and element created here.
 *
 * `p` is story progress (0–1), not the raw scroll fraction: the sky scene
 * keeps its original scroll distance and everything after it gets a longer
 * track (story()/toRaw()). All numbers below, and the chapters' data-in /
 * data-out, are in `p`.
 */

export interface JourneyOptions {
  /** true while the dark stage sits under the site nav */
  onTone?: (dark: boolean) => void;
  /** fired once, when the visitor scrolls through to the end */
  onEnd?: () => void;
}

export interface JourneyHandle {
  destroy: () => void;
  goTo: (chapter: number) => void;
  skip: () => void;
  /** back to the first scene (p = 0), instantly */
  restart: () => void;
}

// Section height in vh: the prototype's track, plus a short handover tail.
// The section overlaps the homepage hero by a full screen (margin-bottom in
// journey.css), so the hero rises into place *underneath* the stage: unseen
// while the finale is at rest, then revealed as the stage dissolves over the
// tail. The tail is the last TAIL_VH of that rise, so the hero is already most
// of the way up when the light opens onto it and exactly in place when it ends
// — the light reveals the hero, never an empty page. Keep in sync with journey.css.
const TRACK_VH = 1350;
const TAIL_VH = 45;
// the stage is fully dissolved, and the journey counts as finished, from this point of the tail
const TAIL_DONE = 0.9;
// film grain strength over the video scenes (0 = off)
const GRAIN = 0.14;
// images of a later scene start loading this far (in p) before the scene
const LEAD = 0.12;

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const sm = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const band = (a1: number, a2: number, b1: number, b2: number, x: number) => sm(a1, a2, x) * (1 - sm(b1, b2, x));

// The sky scene keeps its original scroll distance; everything after it gets a longer track (holds on sharp stills).
// story(): raw scroll fraction → story progress p used everywhere else.  toRaw(): the inverse.
const R0 = 0.2484;
const S0 = 0.345;
const story = (r: number) => (r < R0 ? (r * S0) / R0 : S0 + ((r - R0) * (1 - S0)) / (1 - R0));
const toRaw = (s: number) => (s < S0 ? (s * R0) / S0 : R0 + ((s - S0) * (1 - R0)) / (1 - S0));

// book stills: crop box inside the 2048² source frame (same framing as V1/V2)
const CROP: Record<string, [number, number, number, number]> = {
  "book-05": [33, 120, 2030, 1875],
  "book-06": [32, 3, 2048, 1939],
  "book-06b": [22, 0, 2048, 1831],
  "book-07": [0, 0, 2048, 1824],
};
// peak cutouts: plinth centre x, plinth top y, plinth width, rock base y (px in the webp)
const PK = {
  A: { w: 964, h: 768, cx: 670, top: 100, pw: 184, base: 683 },
  B: { w: 420, h: 1000, cx: 209, top: 338, pw: 175, base: 977 },
};
// fx,fy centre (fraction of viewport), s width (× s0), d mouse-parallax depth, ar height/width,
// k dive depth: how strongly the island scales when the camera dives (book plane = 1, nearer > 1)
const ROCK = [
  { fx: 0.13, fy: 0.66, s: 0.3, d: 60, img: "rock1", ar: 769 / 519, ph: 0, k: 1.45 },
  { fx: 0.8, fy: 0.28, s: 0.12, d: 20, img: "rock2", ar: 873 / 519, ph: 1.7, k: 0.5 },
  { fx: 0.88, fy: 0.7, s: 0.26, d: 50, img: "rock3", ar: 897 / 513, ph: 3.1, k: 1.3 },
  { fx: 0.24, fy: 0.26, s: 0.1, d: 16, img: "rock4", ar: 751 / 466, ph: 4.4, k: 0.4 },
];
// portrait positions
const ROCKP = [
  { fx: 0.06, fy: 0.8, s: 0.3 },
  { fx: 0.84, fy: 0.26, s: 0.16 },
  { fx: 0.95, fy: 0.86, s: 0.26 },
  { fx: 0.16, fy: 0.22, s: 0.13 },
];
const PAGE_AR = [1000 / 573, 496 / 592, 672 / 600, 821 / 564, 531 / 446, 735 / 612];
// hall foreground books: few, large, close to the camera, hugging the left/right edges.
// side −1 left / +1 right, h height (× screen height), ar height/width, dir +1 rises / −1 falls, near = closest (blurred)
const FLY_DEF = [
  { k: "fly9", side: -1, h: 0.4, ar: 790 / 699, o: 0.05, sp: 0.8, dir: 1, near: true },
  { k: "fly2", side: 1, h: 0.34, ar: 798 / 1000, o: 0.33, sp: 0.7, dir: -1, near: true },
  { k: "fly1", side: 1, h: 0.25, ar: 537 / 886, o: 0.72, sp: 1.05, dir: 1, near: false },
  { k: "fly6", side: -1, h: 0.28, ar: 617 / 841, o: 0.55, sp: 0.95, dir: -1, near: false },
  { k: "fly4", side: 1, h: 0.26, ar: 582 / 725, o: 0.02, sp: 0.85, dir: 1, near: false },
];

// Phones (narrow or portrait screens) never play the full-screen clips V4–V8: a 16:9 clip
// cropped to a portrait screen is upscaled 4–5× and looks soft and blocky. They get the sharp
// stills instead, each with its own slow scroll-driven camera move, and soft crossfades.
const MOBILE_MAX_W = 900;
// Camera per still (by its key), over the range of p in which that still is on screen:
// zoom z0→z1 toward the focal point (fx, fy as % of the image), optional slow rotation (deg).
// A still shared by two scenes (12, 13) gets one continuous move across both.
const STILL_CAM: Record<string, { a: number; b: number; z0: number; z1: number; fx: number; fy: number; rot?: number }> = {
  "09": { a: 0.335, b: 0.46, z0: 1.05, z1: 1.2, fx: 52, fy: 48, rot: 7 },  // tunnel core, slowly spinning (09B is the smallest still: a gentler zoom)
  "10": { a: 0.448, b: 0.61, z0: 1, z1: 1.22, fx: 48, fy: 53 },            // the library on the lake
  "11": { a: 0.598, b: 0.69, z0: 1, z1: 1.3, fx: 50, fy: 47 },             // the door
  "12": { a: 0.64, b: 0.835, z0: 1, z1: 1.16, fx: 50, fy: 62 },            // the hall, toward the table
  "13": { a: 0.78, b: 0.962, z0: 1, z1: 1.16, fx: 50, fy: 62 },            // the books in flight, the table
  "15": { a: 0.915, b: 1, z0: 1, z1: 1.12, fx: 54, fy: 72 },               // the open book
};
// V3 (the dive) is 640px square. On a phone the dive would blow it up ~4× before the flash;
// there it stops growing at this multiple of its real pixels, and the flash arrives a little sooner.
const V3_PX = 640;
const V3_MAX_UPSCALE = 2.6;

interface VidDef {
  id: string;
  /** a→b: the scroll range over which the clip goes from its first to its last frame */
  a: number;
  b: number;
  boot?: boolean;
  full?: boolean;
  /** sharp still that fades back in over e0→e1 */
  end?: string;
  e0?: number;
  e1?: number;
  /** phones: the end still fades in over this range instead (no clip in between, so a longer, softer dissolve) */
  m0?: number;
  m1?: number;
  /** [scale, x%, y%] at the clip's first frame, then at its last — tiny corrections measured against the
   * sharp stills so each handover lands pixel-aligned; the clip eases from the first fit to the second as it plays. */
  fit?: number[];
}
// Each full-screen clip sits on a sharp still: the still shows at rest, the video fades in only
// while the scene moves (from a), and `end` (a sharp still) fades back in over e0→e1.
const VID_DEFS: VidDef[] = [
  { id: "v1", a: 0.07, b: 0.13, boot: true },
  { id: "v2", a: 0.13, b: 0.2, boot: true },
  { id: "v3", a: 0.2, b: 0.335 },
  { id: "v4", a: 0.352, b: 0.447, full: true },
  { id: "v5", a: 0.53, b: 0.6, full: true, fit: [1.035, 0, -0.25, 1.035, 0, -0.25] },
  { id: "v6", a: 0.62, b: 0.682, full: true, end: "e12", e0: 0.682, e1: 0.69, m0: 0.642, m1: 0.69, fit: [1, 0, 0, 1.015, 0, 0.42] },
  { id: "v7", a: 0.76, b: 0.835, full: true, end: "e13", e0: 0.818, e1: 0.835, m0: 0.782, m1: 0.835, fit: [1.01, 0, -0.11, 1.01, 0, -0.11] },
  { id: "v8", a: 0.9, b: 0.955, full: true, end: "fin15", e0: 0.955, e1: 0.965, m0: 0.918, m1: 0.962, fit: [1.005, 0.06, -0.32, 1, 0, 0] },
];

export function createJourney(root: HTMLElement, opts: JourneyOptions = {}): JourneyHandle {
  const $ = <T extends HTMLElement = HTMLElement>(k: string) => root.querySelector<T>(`[data-j="${k}"]`)!;
  const $$ = <T extends HTMLElement = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel));

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(pointer: coarse)").matches;
  const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
  const dbg = /[#&]p=([\d.]+)/.exec(location.hash); // debug: /#p=0.5 jumps to that point

  let dead = false;
  const offs: Array<() => void> = [];
  const timers: number[] = [];
  const created: HTMLElement[] = [];
  const on = (t: EventTarget, type: string, fn: EventListener, o?: AddEventListenerOptions) => {
    t.addEventListener(type, fn, o);
    offs.push(() => t.removeEventListener(type, fn, o));
  };

  /* ---------- elements ---------- */
  const stage = $("stage");
  const loader = $("loader");
  const rail = $("rail");
  const railFill = $("railFill");
  const skipBtn = $("skip");
  const veil = $("veil");
  const pageGrain = $("grain");
  const vGrain = $("vGrain");
  const flash = $("flash");
  const scenes = { sky: $("sSky"), tun: $("sTun"), lake: $("sLake"), entry: $("sEntry"), hall: $("sHall"), fin: $("sFin") };
  const v3back = $("v3back");
  const cam = $("cam");
  const bgSky = $<HTMLImageElement>("bgSky");
  const peak = $<HTMLImageElement>("peak");
  const glow = $("bookGlow");
  const fin15 = $("fin15");
  const finDim = $("finDim");
  const sil = $<HTMLImageElement>("sil05");
  const dust = $<HTMLCanvasElement>("dust");
  const dctx = dust.getContext("2d")!;

  // a broken image must never show an icon or outline
  const hideOnError = (i: HTMLImageElement) => on(i, "error", () => { i.style.display = "none"; });
  $$<HTMLImageElement>(".j-media img").forEach(hideOnError);

  const BOOKS = $$<HTMLImageElement>(".j-book");
  const [b05, b06, b06b, b07] = BOOKS;
  const rocks = $$<HTMLImageElement>(".j-rock");

  // first-scene images: the only media the first screen waits for
  [bgSky, peak, b05].forEach((i) => i.setAttribute("fetchpriority", "high"));
  b05.src = A["book-05"];
  sil.src = A["book-05"];
  rocks.forEach((r) => { r.src = A[ROCK[+r.dataset.r!].img]; });

  function mk(parent: HTMLElement, cls?: string) {
    const i = new Image();
    i.className = "j-L" + (cls ? " " + cls : "");
    i.alt = "";
    i.decoding = "async";
    hideOnError(i);
    parent.appendChild(i);
    created.push(i);
    return i;
  }
  const PAGES = Array.from({ length: 8 }, (_, i) => {
    const n = i % 6;
    return { el: mk($("skyPages")), src: A["page" + (n + 1)], ar: PAGE_AR[n], a: (i / 8) * Math.PI * 2 + 0.4, r: 0.6 + ((i * 37) % 10) / 25, sp: 0.8 + ((i * 53) % 10) / 20, rot: (i * 83) % 360 };
  });
  const FLY = FLY_DEF.map((q) => ({ ...q, el: mk($("flyers"), q.near ? "j-near" : ""), w: 0, hh: 0 }));
  let flyLoaded = false;

  // full-screen stills of the later scenes: loaded only as their scene approaches (data-at)
  const stills = $$<HTMLImageElement>("img.j-full[data-k]").map((el) => ({ el, at: +(el.dataset.at ?? 0), on: false }));

  /* ---------- chapters / scroll ---------- */
  const chapters = $$(".j-ch");
  const dots = $$<HTMLButtonElement>(".j-rail button");
  const spans = chapters.map((c) => [+c.dataset.in!, +c.dataset.out!] as const);
  const mids = spans.map(([a, b]) => (a === 0 ? 0 : b > 1 ? 1 : (a + b) / 2));

  let W = 0, H = 0, max = 1, tailLen = 1, heroAt = 1;
  let target = 0, tail = 0, visible = true, stageTop = 0, dark: boolean | null = null, ended = false;
  let prog = 0, time = 0, last = performance.now(), started = false, booted = false, running = false, raf = 0;

  function measure() {
    const unit = root.offsetHeight / (TRACK_VH + TAIL_VH);
    max = Math.max(1, unit * TRACK_VH - H);
    tailLen = Math.max(1, unit * TAIL_VH);
    // scroll distance (from the section's top) at which the hero sits at the top of the viewport
    heroAt = root.offsetHeight + (parseFloat(getComputedStyle(root).marginBottom) || 0);
  }
  function setTone(d: boolean) {
    if (d === dark) return;
    dark = d;
    opts.onTone?.(d);
  }
  function onScroll() {
    const r = root.getBoundingClientRect();
    const sc = -r.top;
    target = story(clamp(sc / max, 0, 1));
    // measured from the hero, not the stage, so tail = 1 is "hero in place" on every viewport
    tail = clamp(1 - (heroAt - sc) / tailLen, 0, 1);
    visible = r.top < innerHeight && tail < TAIL_DONE;
    stageTop = r.top > 0 ? r.top : Math.min(0, r.bottom - H);
    // handover: the stage dissolves over the hero rising beneath it, then stops taking clicks
    stage.style.opacity = (1 - sm(0.2, TAIL_DONE, tail)).toFixed(3);
    stage.style.pointerEvents = visible ? "" : "none";
    // the nav sits at the top of the viewport: dark while the stage is under it and the light has not risen
    setTone(r.top < 48 && tail < 0.3);
    if (tail >= TAIL_DONE && !ended) { ended = true; opts.onEnd?.(); }
    if (visible) wake();
  }
  // document position at which the homepage hero sits at the top of the viewport
  const endTop = () => root.getBoundingClientRect().top + scrollY + heroAt;
  function goTo(i: number) {
    const top = root.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + toRaw(mids[i]) * max, behavior: reduced ? "auto" : "smooth" });
  }
  // Straight to the homepage content. Instant, and the loop stops first, so the scenes in between never load.
  function skip() {
    scrollTo({ top: endTop(), behavior: "instant" });
    onScroll();
    prog = target;
  }
  function restart() {
    scrollTo({ top: root.getBoundingClientRect().top + scrollY, behavior: "instant" });
    ended = false;
    onScroll();
    prog = target;
  }
  function updateChapters(p: number) {
    let act = -1;
    const lastI = chapters.length - 1;
    chapters.forEach((c, i) => {
      const [a, b] = spans[i];
      const fi = a === 0 ? 1 : sm(a, a + 0.02, p);
      const fo = b > 1 ? 1 : 1 - sm(b - 0.02, b, p);
      // the finale stays until the tail, then leaves as the veil rises
      const o = fi * fo * (i === lastI ? 1 - sm(0, 0.3, tail) : 1);
      c.style.opacity = o.toFixed(3);
      c.style.visibility = o > 0.01 ? "visible" : "hidden";
      c.style.transform = reduced ? "none" : `translateY(${((1 - fi) * 40 - (1 - fo) * 40).toFixed(1)}px)`;
      c.dataset.live = o > 0.6 ? "1" : "0";
      if (p >= a - 0.02) act = i;
    });
    dots.forEach((d, i) => { d.dataset.on = i === act ? "1" : "0"; });
    railFill.style.height = `calc(${(p * 100).toFixed(2)}% - 12px)`;
  }

  /* ---------- pointer ---------- */
  let mx = 0, my = 0, smx = 0, smy = 0;
  on(window, "pointermove", ((e: PointerEvent) => {
    mx = (e.clientX / (W || 1)) * 2 - 1;
    my = ((e.clientY - stageTop) / (H || 1)) * 2 - 1;
  }) as EventListener, { passive: true });
  // the quill cursor and its gold-dust trail: mouse and pen only, never on touch screens
  const feather = coarse ? null : createFeather(reduced);

  /* ---------- scroll-driven videos ---------- */
  const VIDS = VID_DEFS.map((v) => ({
    ...v,
    el: $<HTMLVideoElement>(v.id),
    endEl: v.end ? $(v.end) : null,
    loaded: false,
    ready: false,
    skip: saveData || (reduced && (v.id === "v1" || v.id === "v2")),
    t: 0,
  }));
  type Vid = (typeof VIDS)[number];
  const VID: Record<string, Vid> = {};
  VIDS.forEach((v) => { VID[v.id] = v; });
  let por: boolean | null = null;
  // phone mode: stills with a camera move instead of the full-screen clips (see MOBILE_MAX_W)
  let mob: boolean | null = null;

  function loadVid(v: Vid) {
    if (v.loaded || v.skip || (mob && v.full)) return;
    v.loaded = true;
    const e = v.el;
    e.muted = true;
    e.playsInline = true;
    on(e, "loadeddata", () => { v.ready = true; }, { once: true });
    on(e, "error", () => { v.skip = true; }, { once: true });
    e.preload = "auto";
    e.src = A[v.id];
    e.load();
  }
  function scrub(v: Vid, p: number, k: number) {
    // nothing loads while the journey is off-screen (e.g. the frame right after "Skip intro")
    if (!v.loaded && booted && visible && p > v.a - 0.1 && p < v.b + 0.06) loadVid(v);
    if (!v.ready || p < v.a - 0.03 || p > v.b + 0.03) return; // far away: leave it alone
    const e = v.el, d = e.duration;
    if (!d || !isFinite(d)) return;
    const tgt = clamp((p - v.a) / (v.b - v.a), 0, 1) * (d - 1 / 30);
    v.t = Math.abs(tgt - v.t) > 1.5 ? tgt : v.t + (tgt - v.t) * k;
    if (!e.seeking && Math.abs(e.currentTime - v.t) > 1 / 60) e.currentTime = v.t;
  }

  /* ---------- layout ---------- */
  let s0 = 0;
  const L = { book: { x: 0, y: 0, w: 0, l: 0, t: 0 }, zEnd: 5, kSky: 0.1 };
  const RC = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
  function box(el: HTMLElement, w: number, h: number, l: number, t: number) {
    Object.assign(el.style, { width: w + "px", height: h + "px", left: l + "px", top: t + "px" });
  }
  // box + transform-origin at the book, so scale() zooms the layer around the book (dive)
  function boxP(el: HTMLElement, w: number, h: number, l: number, t: number) {
    box(el, w, h, l, t);
    el.style.transformOrigin = `${(L.book.x - l).toFixed(1)}px ${(L.book.y - t).toFixed(1)}px`;
  }
  const fullSrc = (el: HTMLElement) => A[el.dataset.k + (por ? "B" : "A")];
  function layout() {
    W = stage.clientWidth;
    H = stage.clientHeight;
    const p2 = W / H < 0.8;
    if (p2 !== por) {
      por = p2;
      const v = por ? "B" : "A";
      bgSky.src = A["01" + v];
      peak.src = A["peak-" + v];
      stills.forEach((s) => { if (s.on) s.el.src = fullSrc(s.el); });
    }
    const m2 = W < MOBILE_MAX_W || por;
    if (m2 !== mob) {
      mob = m2;
      // each still zooms toward its own focal point on phones; on desktop the stills carry no transform of their own
      stills.forEach((s) => {
        const c = STILL_CAM[s.el.dataset.k!];
        s.el.style.transformOrigin = mob && c ? `${c.fx}% ${c.fy}%` : "";
        s.el.style.transform = "";
      });
    }
    measure();
    s0 = Math.min(W, H * 1.15);
    box(cam, W, H, 0, 0);
    // summit: scale the peak so plinth→base fills part of the height, plinth centred
    const K = PK[por ? "B" : "A"], sc = (H * (por ? 0.46 : 0.55)) / (K.base - K.top), plY = H * (por ? 0.6 : 0.55);
    const plW = K.pw * sc, bw = Math.min(plW * (por ? 2.1 : 1.75), W * 0.62), bT = plY + plW * 0.12 - 0.897 * bw, bL = W / 2 - bw / 2;
    L.book = { x: W / 2, y: bT + bw * 0.5, w: bw, l: bL, t: bT };
    // dive: the book plane must grow until V3 (same box as the book) covers the screen
    L.zEnd = (Math.max(W, H) * 1.3) / (bw * 1.25);
    // phones: V3 never grows past V3_MAX_UPSCALE of its real pixels (the flash takes over from there)
    // (1.25 = the camera's own push-in on the whole scene, see frame())
    if (mob) L.zEnd = Math.max(1.6, Math.min(L.zEnd, (V3_MAX_UPSCALE * V3_PX) / (bw * 1.25 * (devicePixelRatio || 1))));
    L.kSky = Math.log(1.15) / Math.log(L.zEnd);
    boxP(bgSky, W * 1.12, H * 1.12, -W * 0.06, -H * 0.06);
    boxP(peak, K.w * sc, K.h * sc, W / 2 - K.cx * sc, plY - K.top * sc);
    BOOKS.forEach((b) => {
      const c = CROP[b.dataset.k!], f = bw / 2048;
      boxP(b, (c[2] - c[0]) * f, (c[3] - c[1]) * f, bL + c[0] * f, bT + c[1] * f);
    });
    {
      const c = CROP["book-05"], f = (bw / 2048) * 0.97, w = (c[2] - c[0]) * f, h = (c[3] - c[1]) * f;
      boxP(sil, w, h, bL + ((c[0] + c[2]) / 2) * (bw / 2048) - w / 2, bT + ((c[1] + c[3]) / 2) * (bw / 2048) - h / 2);
    }
    [VID.v1.el, VID.v2.el, VID.v3.el, v3back].forEach((el) => boxP(el, bw, bw, bL, bT));
    const gw = bw * 2.4;
    boxP(glow, gw, gw, W / 2 - gw / 2, L.book.y - gw / 2);
    rocks.forEach((r) => {
      const i = +r.dataset.r!, R = { ...ROCK[i], ...(por ? ROCKP[i] : {}) }, w = R.s * s0, h = w * R.ar;
      RC[i] = { x: R.fx * W, y: R.fy * H };
      box(r, w, h, R.fx * W - w / 2, R.fy * H - h / 2);
    });
    PAGES.forEach((q) => { const s = bw * 0.18; box(q.el, s, s * q.ar, -s / 2, (-s * q.ar) / 2); });
    FLY.forEach((q) => {
      let h = H * q.h, w = h / q.ar;
      const m = W * (por ? 0.38 : 0.42);
      if (w > m) { h *= m / w; w = m; }
      q.w = w; q.hh = h;
      box(q.el, w, h, -w / 2, -h / 2);
    });
    // full-screen stills and videos share one "cover" box per aspect ratio, so the video sits exactly on its still.
    // (the clips are the 16:9 stills squeezed ~2% narrower: stretching the video to the still's ratio undoes that)
    $$(".j-full").forEach((el) => {
      const ar = el.tagName === "VIDEO" || !por ? +el.dataset.ar! : +el.dataset.arb!;
      let w, h;
      if (W / H > ar) { w = W; h = W / ar; } else { h = H; w = H * ar; }
      box(el, w, h, (W - w) / 2, (H - h) / 2);
    });
    // V8 ends ~11% closer than still 15 (desktop framing): show 15 at that scale so the handover lines up
    if (!mob) fin15.style.transform = "translate(0,1.6%) scale(1.105)";

    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    dust.width = W * dpr;
    dust.height = H * dpr;
    dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  let rT = 0;
  on(window, "resize", () => {
    clearTimeout(rT);
    rT = window.setTimeout(() => { if (dead) return; layout(); onScroll(); }, 100);
  });

  /* ---------- dust (gold) ---------- */
  const NP = reduced ? 30 : coarse ? 55 : 110;
  const P = Array.from({ length: NP }, (_, i) => ({
    x: Math.random(), y: Math.random(), v: 0.2 + Math.random() * 0.8, s: 0.6 + Math.random() * 1.8, a: Math.random() * 6.28,
    book: !reduced && i < NP * 0.45, bx: undefined as number | undefined,
  }));
  function dot(x: number, y: number, r: number, a: number) {
    const g = dctx.createRadialGradient(x, y, 0, x, y, r * 4);
    g.addColorStop(0, `rgba(255,246,222,${a})`);
    g.addColorStop(0.35, `rgba(212,175,95,${a * 0.45})`);
    g.addColorStop(1, "rgba(185,148,81,0)");
    dctx.fillStyle = g;
    dctx.beginPath();
    dctx.arc(x, y, r * 4, 0, 6.283);
    dctx.fill();
  }
  // zd: dive zoom for the particles — they stream outward from the book as the camera moves in
  function drawDust(p: number, t: number, dt: number, bookScreen: { x: number; y: number }, openAmt: number, zd: number) {
    dctx.clearRect(0, 0, W, H);
    dctx.globalCompositeOperation = "lighter";
    const inHall = band(0.69, 0.71, 0.97, 1.2, p), tun = band(0.338, 0.35, 0.448, 0.46, p);
    const amb = 0.35 + inHall * 0.45 + tun * 0.6;
    for (const q of P) {
      if (q.book && openAmt > 0.02 && p < 0.3 && zd < 1.05) { // rising from the opening book
        if (q.bx === undefined || q.y < -0.25 || q.y > 0) { q.bx = (Math.random() - 0.5) * 0.12; q.y = -Math.random() * 0.05; }
        q.y -= dt * q.v * 0.07;
        const lift = -q.y, X = bookScreen.x + q.bx * W * 0.5 * (1 + lift * 2) + Math.sin(t * 1.3 + q.a) * 12, Y = bookScreen.y + q.y * H;
        const al = openAmt * (1 - lift / 0.25) * 0.95;
        if (al > 0.01) dot(X, Y, q.s * 1.3, al);
      } else {
        q.y -= dt * q.v * 0.018 * (1 + tun * 6);
        q.x += Math.sin(t * 0.4 + q.a) * dt * 0.004;
        if (q.y < -0.02) { q.y = 1.02; q.x = Math.random(); }
        const al = amb * (0.35 + 0.65 * Math.abs(Math.sin(t * 0.8 + q.a)));
        let X = q.x * W, Y = q.y * H, r = q.s;
        if (zd > 1.001) {
          const z = Math.pow(zd, 0.35 + q.v * 0.9);
          X = bookScreen.x + (X - bookScreen.x) * z;
          Y = bookScreen.y + (Y - bookScreen.y) * z;
          r *= Math.min(3, Math.sqrt(z));
        }
        dot(X, Y, r, al * 0.7);
      }
    }
    dctx.globalCompositeOperation = "source-over";
  }

  /* ---------- frame ---------- */
  function vis(el: HTMLElement, o: number) { el.style.opacity = o.toFixed(3); el.style.visibility = o > 0.002 ? "visible" : "hidden"; }
  function op(el: HTMLElement, o: number) { el.style.opacity = o.toFixed(3); }
  function frame(now: number) {
    if (dead) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    time += dt;
    prog += (target - prog) * (1 - Math.pow(1 - 0.08, dt * 60));
    const p = prog;
    const k = 1 - Math.pow(1 - 0.06, dt * 60);
    smx += (mx - smx) * k;
    smy += (my - smy) * k;
    const par = reduced ? 0 : 1, ax = smx * par, ay = smy * par, sway = reduced ? 0 : 1;
    const kv = 1 - Math.pow(1 - 0.25, dt * 60);
    VIDS.forEach((v) => scrub(v, p, kv));
    if (visible) stills.forEach((s) => { if (!s.on && p > s.at - LEAD) { s.on = true; s.el.src = fullSrc(s.el); } });
    if (visible && !flyLoaded && p > 0.765 - LEAD) { flyLoaded = true; FLY.forEach((q) => { q.el.src = A[q.k]; }); }
    const r1 = VID.v1.ready, r2 = VID.v2.ready, r3 = VID.v3.ready;

    /* scene opacities. entry→hall and hall→finale cross over the same sharp still (12, 13), so they are seamless */
    const oSky = 1 - sm(0.338, 0.352, p), oTun = band(0.338, 0.35, 0.448, 0.458, p), oLake = band(0.448, 0.458, 0.598, 0.608, p),
      oEntry = band(0.598, 0.608, 0.69, 0.7, p), oHall = band(0.69, 0.7, 0.895, 0.905, p), oFin = sm(0.895, 0.905, p);
    // exactly one grain layer per scene: the page grain in the sky/book scene, the film grain over the video scenes
    op(vGrain, (1 - oSky) * GRAIN);
    op(pageGrain, oSky * 0.07);
    vis(scenes.sky, oSky); vis(scenes.tun, oTun); vis(scenes.lake, oLake); vis(scenes.entry, oEntry); vis(scenes.hall, oHall); vis(scenes.fin, oFin);
    // phones: the dive ends on its flash a little sooner, before V3 gets large
    const fl = Math.max(band(mob ? 0.295 : 0.315, mob ? 0.33 : 0.338, 0.348, 0.375, p), band(0.44, 0.451, 0.456, 0.475, p) * 0.85, band(0.59, 0.601, 0.605, 0.62, p) * 0.3);
    op(flash, fl * (reduced ? 0.4 : 1));

    /* 1 — sky, summit, book, dive */
    let bookScreen = { x: W / 2, y: H / 2 }, open = 0, zd = 1;
    if (oSky > 0) {
      const rise = H * 0.62 * (1 - sm(0, 0.06, p)), bob = Math.sin(time * 1.1) * 5 * sway;
      const sx = -ax * 18, sy = rise - ay * 10 + bob;
      // camera, part 1: bring the book toward the centre with a gentle push-in of the whole scene
      const c = sm(0.06, 0.22, p), s = 1 + c * 0.25;
      const bx = L.book.x + sx, by = L.book.y + sy, Xs = lerp(bx, W / 2, c), Ys = lerp(by, H * 0.46, c);
      cam.style.transform = `translate3d(${(Xs - bx * s).toFixed(1)}px,${(Ys - by * s).toFixed(1)}px,0) scale(${s.toFixed(4)})`;
      // camera, part 2 (the dive): every layer zooms around the book, each by its depth —
      // sky least (~1.15×), far islands a little, the peak/book plane fully, near islands most (they fly off-screen)
      const e = sm(0.205, 0.33, p), zB = Math.pow(L.zEnd, e), zS = Math.pow(L.zEnd, e * L.kSky);
      zd = zB;
      bgSky.style.transform = `translate3d(${(-ax * 10).toFixed(1)}px,${(-ay * 7 - p * 40).toFixed(1)}px,0) scale(${zS.toFixed(4)})`;
      const st = `translate3d(${sx.toFixed(1)}px,${sy.toFixed(1)}px,0) scale(${zB.toFixed(4)})`;
      peak.style.transform = glow.style.transform = sil.style.transform = st;
      BOOKS.forEach((b) => { b.style.transform = st; });
      VID.v1.el.style.transform = VID.v2.el.style.transform = VID.v3.el.style.transform = v3back.style.transform = st;
      // book: video when ready, otherwise (or with reduced motion) the 05→06→06B→07 stills
      let o1 = 0, o2 = 0, o05 = 1, o06 = 0, o06b = 0, o07 = 0;
      if (r1) { o05 = 0; o1 = 1 - (r2 ? sm(0.127, 0.133, p) : 0); o2 = r2 ? sm(0.127, 0.133, p) : 0; }
      else { o05 = 1 - sm(0.09, 0.11, p); o06 = band(0.09, 0.11, 0.14, 0.16, p); o06b = band(0.14, 0.16, 0.18, 0.2, p); o07 = sm(0.18, 0.2, p); }
      const out = r3 ? sm(0.198, 0.206, p) : 0;
      op(b05, o05 * (1 - out)); op(b06, o06 * (1 - out)); op(b06b, o06b * (1 - out)); op(b07, o07 * (1 - out));
      op(VID.v1.el, o1 * (1 - out)); op(sil, r1 ? (1 - sm(0.135, 0.16, p)) * (1 - out) * 0.9 : 0); op(VID.v2.el, o2 * (1 - out));
      // V3 lives in the book's box and grows with the scene; a soft dark backing keeps it solid over the bright sky
      op(VID.v3.el, out); op(v3back, out * 0.7 * (1 - sm(0.27, 0.31, p)));
      open = sm(0.09, 0.2, p);
      op(glow, (0.2 + open * 0.6) * (1 - e));
      rocks.forEach((r) => {
        const i = +r.dataset.r!, R = ROCK[i], zr = Math.pow(L.zEnd, e * R.k);
        const yb = Math.sin(time * 0.7 + R.ph) * 10 * sway;
        const tx = -ax * R.d + (RC[i].x - L.book.x) * (zr - 1), ty = yb - ay * R.d * 0.6 - p * R.d * 6 + (RC[i].y - L.book.y) * (zr - 1);
        r.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) rotate(${(Math.sin(time * 0.4 + R.ph) * 3 * sway).toFixed(2)}deg) scale(${zr.toFixed(4)})`;
      });
      // pages burst out of the opening book and swirl within ~1.5× the book, then fade
      const ph = reduced ? 0 : sm(0.15, 0.215, p), bw = L.book.w;
      PAGES.forEach((q) => {
        if (ph <= 0.001 || ph >= 0.999) { q.el.style.opacity = "0"; return; }
        const a = q.a + ph * 3.2 * q.sp + time * 0.2, r = bw * 0.75 * q.r * Math.sin((Math.min(1, ph * 1.6) * Math.PI) / 2);
        const x = L.book.x + sx + Math.cos(a) * r, y = L.book.y + sy - bw * 0.2 * ph * q.sp + Math.sin(a) * r * 0.45;
        q.el.style.opacity = (Math.min(1, ph * 6) * (1 - sm(0.6, 1, ph))).toFixed(3);
        q.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${(q.rot + ph * 200 * q.sp).toFixed(1)}deg) scale(${(0.35 + 0.65 * sm(0, 0.4, ph)).toFixed(3)})`;
      });
      bookScreen = { x: Xs, y: Ys };
    }
    /* 2–6 — full-screen scenes: sharp still at rest, video only while the scene moves.
       The still and the video share one container, so they get the same slow zoom and mouse parallax. */
    const pan = (sc: HTMLElement, a: number, b: number, z0: number, z1: number) => {
      // phones: the zoom belongs to each still's own camera (below), the container only carries the parallax
      const z = mob ? 1 : lerp(z0, z1, clamp((p - a) / (b - a), 0, 1));
      (sc.firstElementChild as HTMLElement).style.transform = `translate3d(${(-ax * 14).toFixed(1)}px,${(-ay * 10).toFixed(1)}px,0) scale(${z.toFixed(4)})`;
    };
    if (oTun > 0) pan(scenes.tun, 0.338, 0.458, 1.05, 1.1);
    if (oLake > 0) pan(scenes.lake, 0.448, 0.608, 1.05, 1.08);
    if (oEntry > 0) pan(scenes.entry, 0.598, 0.69, 1.05, 1.08);
    if (oHall > 0) pan(scenes.hall, 0.69, 0.895, 1.08, 1.05);
    if (oFin > 0) { pan(scenes.fin, 0.905, 1, 1.05, 1.08); op(finDim, sm(0.95, 0.975, p)); }
    const fd = por ? 0.02 : 0.012; // portrait stills (B) are framed differently from the 16:9 clips: a slightly longer dissolve
    VIDS.forEach((v) => {
      if (!v.full) return;
      op(v.el, v.ready && !mob ? sm(v.a, v.a + fd, p) : 0);
      if (v.fit) {
        const u = clamp((p - v.a) / (v.b - v.a), 0, 1), f = v.fit;
        v.el.style.transform = `translate(${lerp(f[1], f[4], u).toFixed(3)}%,${lerp(f[2], f[5], u).toFixed(3)}%) scale(${lerp(f[0], f[3], u).toFixed(4)})`;
      }
      if (v.endEl) op(v.endEl, mob ? sm(v.m0!, v.m1!, p) : sm(Math.min(v.e0!, v.e1! - fd), v.e1!, p));
    });
    /* phones — a slow scroll-driven camera on every still: push in toward its focal point (the tunnel also turns) */
    if (mob) {
      stills.forEach((s) => {
        const c = STILL_CAM[s.el.dataset.k!];
        if (!c || !s.on || p < c.a - 0.02 || p > c.b + 0.02) return;
        const u = reduced ? 0 : clamp((p - c.a) / (c.b - c.a), 0, 1);
        s.el.style.transform = `scale(${lerp(c.z0, c.z1, u).toFixed(4)})${c.rot ? ` rotate(${(c.rot * u).toFixed(2)}deg)` : ""}`;
      });
    }
    /* flying books: close to the camera along the left/right edges, the centre stays clear */
    const fv = band(0.765, 0.79, 0.88, 0.9, p);
    if (fv > 0) {
      FLY.forEach((q) => {
        const u = (((time * 0.03 * q.sp * sway + q.o + p * 5 * q.sp) % 1) + 1) % 1, near = Math.sin(u * Math.PI);
        const y = q.dir > 0 ? lerp(H + q.hh * 0.6, -q.hh * 0.6, u) : lerp(-q.hh * 0.6, H + q.hh * 0.6, u);
        const inx = W * (por ? 0.04 : 0.09) * near, off = por ? -0.06 : 0.01, x = q.side < 0 ? W * off + inx : W * (1 - off) - inx, d = q.near ? 1.6 : 1;
        q.el.style.opacity = (fv * Math.min(1, near * 3)).toFixed(3);
        q.el.style.transform = `translate3d(${(x - ax * 90 * d).toFixed(1)}px,${(y - ay * 50 * d).toFixed(1)}px,0) rotate(${(Math.sin(time * 0.9 + q.o * 7) * 9 * sway + q.side * q.dir * (14 - 28 * u)).toFixed(1)}deg) scale(${(0.8 + 0.4 * near).toFixed(3)})`;
      });
    } else FLY.forEach((q) => { q.el.style.opacity = "0"; });

    drawDust(p, time, reduced ? 0 : dt, bookScreen, open * oSky, oSky > 0 ? zd : 1);
    updateChapters(p);

    /* tail — a cream light rises over the finale while the whole stage dissolves (onScroll) onto the hero beneath */
    op(veil, sm(0, 0.5, tail));
    const chrome = 1 - sm(0, 0.2, tail);
    vis(rail, chrome);
    vis(skipBtn, chrome);

    if (!started) {
      started = true;
      timers.push(window.setTimeout(() => { loader.dataset.done = "1"; }, 300));
      // the book clips and the fallback stills wait for an idle moment, so they never compete with the first screen
      const boot = () => {
        if (dead) return;
        booted = true;
        VIDS.forEach((v) => { if (v.boot) loadVid(v); });
        b06.src = A["book-06"]; b06b.src = A["book-06b"]; b07.src = A["book-07"];
        PAGES.forEach((q) => { q.el.src = q.src; });
      };
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) w.requestIdleCallback(boot, { timeout: 1500 });
      else timers.push(window.setTimeout(boot, 300));
    }
    // the quill belongs to the journey only: gone (system cursor back) once the light rises onto the hero
    feather?.frame(dt, visible && tail < 0.3);
    // off-screen: stop the loop; onScroll wakes it when the journey is back in view
    if (visible) raf = requestAnimationFrame(frame);
    else running = false;
  }
  function wake() {
    if (running || dead || !started) return;
    running = true;
    raf = requestAnimationFrame((t) => { last = t; frame(t); });
  }

  /* ---------- boot ---------- */
  layout();
  on(window, "scroll", onScroll, { passive: true });
  if (dbg) scrollTo(0, root.getBoundingClientRect().top + scrollY + toRaw(clamp(+dbg[1], 0, 1)) * max);
  onScroll();
  prog = target;
  const first = [bgSky, peak, b05, ...rocks];
  const ready = Promise.all(first.map((i) => (i.decode ? i.decode().catch(() => {}) : Promise.resolve())));
  Promise.race([ready, new Promise((r) => timers.push(window.setTimeout(r, 4000)))]).then(() => {
    if (dead) return;
    running = true;
    raf = requestAnimationFrame((t) => { last = t; frame(t); });
  });

  return {
    goTo,
    skip,
    restart,
    destroy() {
      dead = true;
      cancelAnimationFrame(raf);
      clearTimeout(rT);
      timers.forEach(clearTimeout);
      offs.forEach((off) => off());
      feather?.destroy();
      VIDS.forEach((v) => { if (v.loaded) { v.el.removeAttribute("src"); v.el.load(); } });
      created.forEach((el) => el.remove());
      delete loader.dataset.done;
      stage.style.opacity = "";
      stage.style.pointerEvents = "";
    },
  };
}

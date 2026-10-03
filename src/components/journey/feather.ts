import { A } from "./assets";

/**
 * The journey's cursor: a golden quill whose nib tip is the pointer's exact
 * position, writing a trail of gold dust. Both live in fixed layers on
 * <body> (not inside the stage) so the quill also shows over the site nav
 * while the nav sits on the journey. Neither layer ever takes pointer events.
 *
 * The engine drives it: frame(dt, allow) once per animation frame, with
 * `allow` false as soon as the journey hands over to the homepage — the quill
 * and its trail are then removed and the system cursor comes back.
 */

// feather-cursor.webp is 64×96; its nib tip (the hotspot) is at the bottom-left
const HOT_X = 4.7;
const HOT_Y = 96;
// hard cap, so a fast mouse can never build up an expensive trail
const MAX_PARTICLES = 140;

interface Particle {
  x: number; y: number; vx: number; vy: number; g: number;
  /** radius of the bright core, px */
  r: number; age: number; life: number; ph: number;
}

export interface Feather {
  frame: (dt: number, allow: boolean) => void;
  destroy: () => void;
}

export function createFeather(reduced: boolean): Feather {
  const html = document.documentElement;
  const el = document.createElement("div");
  el.className = "j-feather";
  el.setAttribute("aria-hidden", "true");
  const img = new Image();
  img.alt = "";
  img.draggable = false;
  img.srcset = `${A.feather} 1x, ${A.feather2x} 2x`;
  img.src = A.feather;
  img.style.left = `${-HOT_X}px`;
  img.style.top = `${-HOT_Y}px`;
  img.style.transformOrigin = `${HOT_X}px ${HOT_Y}px`;
  el.appendChild(img);
  const cv = document.createElement("canvas");
  cv.className = "j-trail";
  cv.setAttribute("aria-hidden", "true");
  document.body.append(cv, el);
  const ctx = cv.getContext("2d")!;

  // one soft gold dot, drawn once and stamped for every particle
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 32;
  {
    const s = sprite.getContext("2d")!;
    const g = s.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255,246,222,1)");
    g.addColorStop(0.3, "rgba(212,175,95,0.55)");
    g.addColorStop(1, "rgba(185,148,81,0)");
    s.fillStyle = g;
    s.fillRect(0, 0, 32, 32);
  }

  let W = 0, H = 0;
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = innerWidth;
    H = innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  // tx,ty: the real pointer.  x,y: the nib tip, following it.
  let tx = 0, ty = 0, x = 0, y = 0, tilt = 0;
  let inside = false, moved = false, shown = false, dirty = false;
  let acc = 0, idle = 0.6;
  let P: Particle[] = [];
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);

  function spawn(px: number, py: number, vx: number, vy: number, big = false) {
    P.push({ x: px, y: py, vx, vy, g: rnd(60, 150), r: big ? rnd(1.5, 2.7) : rnd(0.9, 2.2), age: 0, life: rnd(0.6, 1.2), ph: Math.random() * 6.28 });
    if (P.length > MAX_PARTICLES) P.splice(0, P.length - MAX_PARTICLES);
  }
  // click: a small burst of sparkles from the tip
  function burst() {
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * 6.283, s = rnd(50, 210);
      spawn(x, y, Math.cos(a) * s, Math.sin(a) * s - 40, true);
    }
  }

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    tx = e.clientX;
    ty = e.clientY;
    if (!moved) { moved = true; x = tx; y = ty; }
    inside = true;
  };
  const onOver = (e: PointerEvent) => { el.dataset.hot = (e.target as Element | null)?.closest?.("a,button") ? "1" : "0"; };
  const onDown = (e: PointerEvent) => { if (shown && !reduced && e.pointerType !== "touch") burst(); };
  const onLeave = () => { inside = false; };
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });
  document.addEventListener("pointerover", onOver, { passive: true });
  html.addEventListener("pointerleave", onLeave);
  window.addEventListener("blur", onLeave);
  window.addEventListener("resize", resize);

  function show(on: boolean) {
    if (on === shown) return;
    shown = on;
    el.dataset.on = on ? "1" : "0";
    html.classList.toggle("j-feather-on", on);
    if (!on) {
      // back to the system cursor: the trail goes with the quill
      P = [];
      acc = 0;
      tilt = 0;
      if (dirty) { ctx.clearRect(0, 0, W, H); dirty = false; }
    } else {
      x = tx;
      y = ty;
    }
  }

  function frame(dt: number, allow: boolean) {
    show(allow && inside && moved);
    if (!shown || dt <= 0) return;

    // a slight smooth follow; the tip lands exactly on the pointer as soon as it rests
    const ox = x, oy = y;
    const k = reduced ? 1 : 1 - Math.pow(1 - 0.5, dt * 60);
    x += (tx - x) * k;
    y += (ty - y) * k;
    if (Math.abs(tx - x) < 0.05) x = tx;
    if (Math.abs(ty - y) < 0.05) y = ty;
    const dx = x - ox, dy = y - oy, dist = Math.hypot(dx, dy), speed = dist / dt;
    // tilt against the direction of travel, like a quill being drawn across a page
    const want = reduced ? 0 : Math.max(-16, Math.min(16, (-dx / dt) * 0.012));
    tilt += (want - tilt) * (1 - Math.pow(1 - 0.14, dt * 60));
    el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${tilt.toFixed(2)}deg)`;

    if (!reduced) {
      // emission follows distance travelled: fast strokes leave a dense trail that drifts behind the quill
      acc = Math.min(acc + dist / 11, 8);
      const n = Math.floor(acc);
      acc -= n;
      for (let i = 0; i < n; i++) {
        const u = (i + Math.random()) / n;
        spawn(ox + dx * u + rnd(-1.5, 1.5), oy + dy * u + rnd(-1.5, 1.5),
          -(dx / dt) * 0.07 + rnd(-16, 16), -(dy / dt) * 0.07 + rnd(-8, 26));
      }
    }
    // at rest (or always, with reduced motion): only an occasional soft sparkle at the tip
    if (reduced || speed < 25) {
      idle -= dt;
      if (idle <= 0) {
        idle = reduced ? rnd(2, 3.6) : rnd(0.9, 2);
        spawn(x + rnd(-2, 2), y + rnd(-2, 1), rnd(-6, 6), rnd(-4, 10), true);
      }
    }

    if (!P.length && !dirty) return;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    let alive = 0;
    for (const q of P) {
      q.age += dt;
      if (q.age >= q.life) continue;
      const drag = Math.pow(0.12, dt);
      q.vx *= drag;
      q.vy = q.vy * drag + q.g * dt;
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      const u = q.age / q.life;
      // fades and shrinks over its life, with a faint twinkle
      const al = Math.pow(1 - u, 1.3) * (0.75 + 0.25 * Math.sin(q.age * 22 + q.ph));
      const r = q.r * (1 - u * 0.6) * 4;
      ctx.globalAlpha = Math.max(0, Math.min(1, al));
      ctx.drawImage(sprite, q.x - r, q.y - r, r * 2, r * 2);
      P[alive++] = q;
    }
    P.length = alive;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    dirty = alive > 0;
  }

  return {
    frame,
    destroy() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerover", onOver);
      html.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("resize", resize);
      html.classList.remove("j-feather-on");
      el.remove();
      cv.remove();
    },
  };
}

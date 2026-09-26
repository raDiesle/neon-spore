import { halo } from "./glow.js";
import { drawScutes, shadeBody } from "./instar-body-shade.js";
import { drawNests } from "./instar-eggs.js";
import { drawScales } from "./instar-hide.js";
import { drawMoult } from "./instar-moult.js";
import { instarAt, instarFarEnd, type Point } from "./instar-place.js";
import { drawLamp, drawPlate, drawSeam, type Look } from "./instar-plate.js";
import { drawSideHead } from "./instar-side-head.js";
import { drawTail } from "./instar-tail.js";
import { drawWing } from "./instar-wings.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **THE INSTAR side-on**: the perspective the owner asked to change to on 25
 * September 2026 — *the perspective has changed so we see him from the side*.
 * Head to the left, the long plated body across the field, the back up with
 * the two nests on it (`instar-eggs.ts`), the near wing raised off the back
 * and the far one behind it, the engines at the rear, the tail out behind or
 * curled over at the ship (`instar-tail.ts`).
 *
 * **The back runs through the nests.** The spine is a spline from the neck,
 * under each nest, to the rear, so wherever a pose puts its nests the eggs
 * sit on the body and not beside it (`instar-poses.ts`) — and the moult's
 * split runs along it too (`instar-moult.ts`).
 */

/** Samples along the spine. */
const N = 16;

/**
 * The long body's own idle wobble on `Form.angle`, same reasoning as the
 * skull's `CROWN_WOBBLE` (`instar-side-head.ts`, `docs/style-guide.md`'s
 * "Depth on a body that already ships"): the plate's shading is otherwise a
 * still life between morphs, since the pose only turns it when the spine
 * itself moves. A different period than the skull's, so the two lit
 * shoulders do not slide in step — "phase offset is the cheapest detail
 * available" (`docs/style-guide.md`, Motion).
 */
const BODY_WOBBLE = 0.05;
const BODY_WOBBLE_PERIOD = 7.2;

/** How far into the body the inner ember glow sits, and how it breathes: the
 * lung a dragon's fire comes from, showing through the hide as a soft pulse
 * rather than a lit surface — the "glow inside of body" the owner asked for
 * on 26 September 2026, alongside gradients and fills already in `lightHide`. */
const EMBER_GLOW_AT = 0.22;
const EMBER_GLOW_PERIOD = 3.4;

export function drawProfile(ctx: CanvasRenderingContext2D, l: Layout, look: Look): void {
  const { f, head, r, fade, hurt, time } = look;
  const rear = instarFarEnd(l, f);
  const nest = instarAt(l, f.nestX, f.nestY);
  const eggs = instarAt(l, f.eggsX, f.eggsY);
  // The nearer nest to the head first, whichever it is, so the back does not
  // double on itself when the brood's nests change sides.
  const [near, far] = nest.x <= eggs.x ? [nest, eggs] : [eggs, nest];
  const knots = [
    { x: head.x + r * 0.7, y: head.y + r * 0.15 },
    { x: near.x, y: near.y + r * 0.42 },
    { x: far.x, y: far.y + r * 0.42 },
    rear,
  ];
  const spine = Array.from({ length: N + 1 }, (_, i) => along(knots, i / N));
  const top: Point[] = [];
  const bottom: Point[] = [];
  spine.forEach((p, i) => {
    const u = i / N;
    const q = spine[Math.min(N, i + 1)] ?? p;
    const o = spine[Math.max(0, i - 1)] ?? p;
    const len = Math.hypot(q.x - o.x, q.y - o.y) || 1;
    const nx = (q.y - o.y) / len;
    const ny = -(q.x - o.x) / len;
    const w = r * (0.34 + 0.2 * Math.sin(Math.PI * Math.min(1, u * 1.3))) * (1 - 0.5 * u);
    top.push({ x: p.x + nx * w, y: p.y + ny * w });
    bottom.push({ x: p.x - nx * w * 0.9, y: p.y - ny * w * 0.9 });
  });
  const back = (u: number): Point => top[Math.round(u * N)] ?? rear;
  const wingAt = { ex: { x: 0, y: r * 0.8 }, ey: { x: r * 0.8, y: 0 } };
  drawWing(
    ctx,
    look,
    { x: back(0.38).x - r * 0.25, y: back(0.38).y - r * 0.1 },
    back(0.62),
    wingAt,
    1,
  );
  const flick = 0.75 + 0.25 * Math.sin(time * 21);
  halo(
    ctx,
    rear.x + r * 0.1,
    rear.y,
    Math.max(4, Math.round((r * 0.4) / 4) * 4),
    PALETTE.ember,
    0.7 * flick * fade,
  );
  const hide = splinePath([...top, ...bottom.reverse()], true);
  bottom.reverse();
  // The whole length lit as one long body: centred on its middle, turned the
  // way it runs from the neck to the rear.
  const from = spine[0] as Point;
  const mid = spine[N / 2] as Point;
  const wobble = BODY_WOBBLE * Math.sin((time * (Math.PI * 2)) / BODY_WOBBLE_PERIOD);
  const form = {
    x: mid.x,
    y: mid.y,
    r: Math.hypot(rear.x - from.x, rear.y - from.y) / 2,
    ry: r * 0.5,
    angle: Math.atan2(rear.y - from.y, rear.x - from.x) + wobble,
  };
  drawPlate(ctx, hide, fade, 0.5, hurt, form);
  shadeBody(ctx, hide, top, bottom, fade);
  drawScales(ctx, hide, { ...form, y: form.y - r * 0.12, ry: r * 0.3 }, r * 0.13, fade);
  drawScutes(ctx, bottom, spine, r, fade);
  const glowAt = spine[Math.round(EMBER_GLOW_AT * N)] as Point;
  const breathe = 0.55 + 0.45 * Math.sin((time * (Math.PI * 2)) / EMBER_GLOW_PERIOD);
  halo(ctx, glowAt.x, glowAt.y, r * 0.5, PALETTE.ember, 0.45 * breathe * fade);
  for (let i = 2; i < N - 1; i += 2) {
    const a = top[i] as Point;
    const b = bottom[i] as Point;
    drawSeam(ctx, a, { x: (a.x + b.x) / 2 + r * 0.12, y: (a.y + b.y) / 2 }, b, fade, 0.35);
    const pulse = 0.6 + 0.4 * Math.sin(time * 2.4 - i * 0.5);
    drawLamp(
      ctx,
      { x: a.x * 0.35 + b.x * 0.65, y: a.y * 0.35 + b.y * 0.65 },
      r * 0.035,
      fade,
      pulse,
    );
  }
  drawMoult(ctx, top, bottom, look);
  drawTail(ctx, l, look, rear);
  drawWing(ctx, look, back(0.42), back(0.7), wingAt);
  drawNests(ctx, l, look);
  drawSideHead(ctx, look);
}

/** A point `u` of the way along a Catmull-Rom spline through `k`. */
function along(k: readonly Point[], u: number): Point {
  const n = k.length - 1;
  const s = Math.min(n - 1e-6, u * n);
  const i = Math.floor(s);
  const t = s - i;
  const p0 = k[Math.max(0, i - 1)] as Point;
  const p1 = k[i] as Point;
  const p2 = k[i + 1] as Point;
  const p3 = k[Math.min(n, i + 2)] as Point;
  const c = (a: number, b: number, c2: number, d: number) =>
    0.5 *
    (2 * b +
      (-a + c2) * t +
      (2 * a - 5 * b + 4 * c2 - d) * t * t +
      (-a + 3 * b - 3 * c2 + d) * t * t * t);
  return { x: c(p0.x, p1.x, p2.x, p3.x), y: c(p0.y, p1.y, p2.y, p3.y) };
}

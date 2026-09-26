import { drawHurt } from "./boss-hurt.js";
import { halo, strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { drawNests } from "./instar-eggs.js";
import { drawMoult } from "./instar-moult.js";
import { instarAt, instarFarEnd, type Point } from "./instar-place.js";
import { drawSeam, faded, type Look } from "./instar-plate.js";
import { BREATH_PERIOD, breathAt, headBob, rollAt, undulate } from "./instar-profile-life.js";
import { bodyOf, drawLamps, drawRidge, drawScales } from "./instar-profile-surface.js";
import { drawScutes } from "./instar-scutes.js";
import { drawSideHead } from "./instar-side-head.js";
import { drawTail } from "./instar-tail.js";
import { drawWing } from "./instar-wings.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawContact } from "./solid-haze.js";
import { drawTube, rimTube } from "./solid-tube-draw.js";

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
 *
 * **The body is a tube of the rig** (`solid-tube.ts`, `drawTube`): one ring
 * per sample of the spine, lit across its width as the cylinder it is, with a
 * rim along its edge and a contact shadow wherever something bears on it.
 * What sits on it is placed round those rings (`instar-profile-surface.ts`),
 * and it breathes, swims and rolls on its own clock (`instar-profile-life.ts`).
 */

/** Samples along the spine, and how many of them one seam, lamp or spine spans. */
const N = 32;
const EVERY = 2;

/** The body's skin on the rig: the hide's own deep violet, lit toward the hull's. */
const SKIN = {
  base: mixHex(PALETTE.sheenDeep, PALETTE.hull, 0.2),
  lift: PALETTE.hull,
  sheen: PALETTE.sheenRim,
};

/** How far into the body the inner ember glow sits: the lung a dragon's fire
 * comes from, showing through the hide as a soft pulse rather than a lit
 * surface — the "glow inside of body" the owner asked for on 26 September
 * 2026. It breathes with the chest (`instar-profile-life.ts`). */
const EMBER_GLOW_AT = 0.22;

export function drawProfile(ctx: CanvasRenderingContext2D, l: Layout, look: Look): void {
  const { f, head, r, fade, hurt, time } = look;
  const nest = instarAt(l, f.nestX, f.nestY);
  const eggs = instarAt(l, f.eggsX, f.eggsY);
  // The nearer nest to the head first, whichever it is, so the back does not
  // double on itself when the brood's nests change sides.
  const [near, far] = nest.x <= eggs.x ? [nest, eggs] : [eggs, nest];
  const knots = [
    { x: head.x + r * 0.7, y: head.y + r * 0.15 },
    { x: near.x, y: near.y + r * 0.42 },
    { x: far.x, y: far.y + r * 0.42 },
    instarFarEnd(l, f),
  ];
  const spine = Array.from({ length: N + 1 }, (_, i) => along(knots, i / N));
  undulate(spine, r, time);
  const rear = spine[N] as Point;
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
    // The lung fills the belly more than the back.
    const lung = breathAt(u, time);
    const up = w * (1 + (lung - 1) * 0.3);
    top.push({ x: p.x + nx * up, y: p.y + ny * up });
    bottom.push({ x: p.x - nx * w * lung * 0.9, y: p.y - ny * w * lung * 0.9 });
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
  const body = bodyOf(top, bottom);
  const roll = rollAt(time);
  drawRidge(ctx, body, r, roll, fade, true, EVERY);
  const hide = drawTube(ctx, body.seen, SKIN, fade);
  strokeGlow(ctx, hide, faded(PALETTE.hull, fade), STROKE.inner, 0.5 * fade);
  drawHurt(ctx, hide, hurt * fade);
  drawScales(ctx, body, hide, r * 0.13, roll, fade);
  const coarse = <T>(a: readonly T[]): T[] => a.filter((_, i) => i % EVERY === 0);
  drawScutes(ctx, coarse(bottom), coarse(spine), r, fade);
  const glowAt = spine[Math.round(EMBER_GLOW_AT * N)] as Point;
  const breathe = 0.55 + 0.45 * Math.sin((time * (Math.PI * 2)) / BREATH_PERIOD);
  halo(ctx, glowAt.x, glowAt.y, r * 0.5, PALETTE.ember, 0.45 * breathe * fade);
  for (let i = EVERY * 2; i < N - 1; i += EVERY * 2) {
    const a = top[i] as Point;
    const b = bottom[i] as Point;
    drawSeam(ctx, a, { x: (a.x + b.x) / 2 + r * 0.12, y: (a.y + b.y) / 2 }, b, fade, 0.35);
  }
  drawLamps(ctx, body, r, roll, time, fade, EVERY * 2);
  drawRidge(ctx, body, r, roll, fade, false, EVERY);
  // Where the nests, the near wing and the head bear on the body.
  for (const p of [near, far]) drawContact(ctx, hide, p.x, p.y + r * 0.42, r * 0.5, fade);
  const root = back(0.42);
  drawContact(ctx, hide, root.x, root.y, r * 0.3, 0.8 * fade);
  drawContact(ctx, hide, (spine[0] as Point).x, (spine[0] as Point).y, r * 0.45, fade);
  rimTube(ctx, hide, PALETTE.sheenRim, r * 0.06, fade);
  drawMoult(ctx, coarse(top), coarse(bottom), look);
  drawTail(ctx, l, look, rear);
  drawWing(ctx, look, back(0.42), back(0.7), wingAt);
  drawNests(ctx, l, look);
  drawSideHead(ctx, { ...look, head: headBob(head, r, time) });
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

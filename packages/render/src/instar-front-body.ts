import { FRONT, type Ring, type SeenRing, seeTube, tubeFrames, view } from "@neon-spore/content";
import { drawHurt } from "./boss-hurt.js";
import { strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { drawScales } from "./instar-hide.js";
import type { Point } from "./instar-place.js";
import { drawLamp, drawSeam, faded, type Look } from "./instar-plate.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawTube, rimTube } from "./solid-tube-draw.js";

/**
 * **THE INSTAR's body face-on, as a tube of the rig**: the long body seen
 * from its head end, going back into the dark. The rings run along the rig's
 * `x`, which the front view turns into depth, so the painter, the light across
 * the width and the rim all treat it as the cylinder it is — pinched in at
 * each seam, so it reads as plates going away rather than one smooth horn.
 *
 * Each ring is placed where the old plates sat on the screen — the lens is
 * divided back out — so the body covers what it always covered; what changed
 * is that it is round. It swims: a slow wave runs down it, the neck and the
 * engines held where they are and the middle swinging, as the side view
 * undulates (`instar-profile-life.ts`).
 */

/** Rings along the body, and how many of them one plate of seam and lamps spans. */
const N = 30;
const EVERY = 6;
/** How far the body pinches in between two plates, so it reads as segments going away. */
const PINCH = 0.16;
/** How deep the body runs behind the neck, and how far off the eye is, in head radii. */
const DEPTH = 6;
const LENS = 10;
/** The swim: how far the middle swings, in head radii, and its period in seconds. */
const SWIM = 0.14;
const SWIM_PERIOD = 4.2;

const SKIN = {
  base: mixHex(PALETTE.sheenDeep, PALETTE.hull, 0.2),
  lift: PALETTE.hull,
  sheen: PALETTE.sheenRim,
};

/** The body from `neck` back to `rear`, the far end first under everything. */
export function drawFrontBody(
  ctx: CanvasRenderingContext2D,
  look: Look,
  neck: Point,
  rear: Point,
): void {
  const { r, fade, hurt, time } = look;
  const w = view(FRONT, 0, r * LENS);
  const rings: Ring[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const x = u * DEPTH * r;
    // The lens at this depth, divided back out so the ring lands where it is meant to.
    const s = LENS / (LENS + u * DEPTH);
    const swim =
      SWIM * r * 4 * u * (1 - u) * Math.sin((time * Math.PI * 2) / SWIM_PERIOD - u * 2.5);
    const at = { x: (rear.x - neck.x) * u + swim, y: (rear.y - neck.y) * u };
    rings.push({ c: { x, y: at.y / s, z: at.x / s }, r: (r * (0.7 - 0.5 * u) * plate(i)) / s });
  }
  const seen = seeTube(rings, tubeFrames(rings), w);
  ctx.save();
  ctx.translate(neck.x, neck.y);
  const hide = drawTube(ctx, seen, SKIN, fade);
  strokeGlow(ctx, hide, faded(PALETTE.hull, fade), STROKE.inner, 0.5 * fade);
  drawHurt(ctx, hide, hurt * fade);
  for (let i = EVERY; i < N; i += EVERY) drawBand(ctx, seen, i, hide, look);
  rimTube(ctx, hide, PALETTE.sheenRim, r * 0.05, fade);
  ctx.restore();
}

/** One plate's worth at ring `i`: scales down to the next ring, its seam, its two lamps. */
function drawBand(
  ctx: CanvasRenderingContext2D,
  seen: readonly SeenRing[],
  i: number,
  hide: Path2D,
  look: Look,
): void {
  const { fade, time } = look;
  const ring = seen[i] as SeenRing;
  const prev = seen[i - EVERY] as SeenRing;
  const rad = ring.r;
  const half = Math.abs(prev.c.y - ring.c.y) / 2;
  const form = { x: ring.c.x, y: ring.c.y + half, r: rad, ry: half };
  drawScales(ctx, hide, form, rad * 0.24, fade);
  const y = ring.c.y + rad * 0.15;
  const c = ring.c;
  drawSeam(
    ctx,
    { x: c.x - rad * 0.9, y },
    { x: c.x, y: y + rad * 0.35 },
    { x: c.x + rad * 0.9, y },
    fade,
    0.4,
  );
  const k = i / EVERY;
  const pulse = 0.6 + 0.4 * Math.sin(time * 2.4 - k * 0.8);
  for (const s of [-1, 1])
    drawLamp(ctx, { x: c.x + s * rad * 0.7, y: c.y }, rad * 0.06, fade, pulse);
}

/** A ring's girth by where it sits in its plate: full across the middle, pinched at the seam. */
function plate(i: number): number {
  return 1 - PINCH * (1 - Math.sin((Math.PI * (i % EVERY)) / EVERY));
}

import {
  FRONT,
  type Frame,
  type Ring,
  type SeenRing,
  seeTube,
  tubeFrames,
  turn as turn3,
  view,
} from "@neon-spore/content";
import { drawHurt } from "./boss-hurt.js";
import { strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import type { Point } from "./instar-place.js";
import { drawSeam, faded, type Look } from "./instar-plate.js";
import { rollAt } from "./instar-profile-life.js";
import {
  type Body,
  drawBelly,
  drawLamps,
  drawRidge,
  drawScales,
} from "./instar-profile-surface.js";
import { swimAt } from "./instar-serpent.js";
import { BODY_DEPTH as DEPTH, BODY_LENS as LENS } from "./instar-turn.js";
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
 * undulates (`instar-profile-life.ts`); and with VERSUS's serpent on, its
 * wave rides down the tube as well (`dive`).
 */

/** Rings along the body, and how many of them one plate of seam and lamps spans. */
const N = 30;
const EVERY = 6;
/** How far the body pinches in between two plates, so it reads as segments going away. */
const PINCH = 0.16;
/** The swim: how far the middle swings, in head radii, and its period in seconds. */
const SWIM = 0.14;
const SWIM_PERIOD = 4.2;

/** The body's skin, which the legs hung off it wear too (`instar-front.ts`). */
export const BODY_SKIN = {
  base: mixHex(PALETTE.sheenDeep, PALETTE.hull, 0.2),
  lift: PALETTE.hull,
  sheen: PALETTE.sheenRim,
};

/**
 * The body from `neck` back to `rear`, seen from `turn` radians round off
 * face-on, as the rig has it: rings, frames and what is seen of them, about
 * the neck. At `0` every ring lands where the old plates sat; turned, the far
 * end swings out to the side the head turns from.
 */
export function frontBody(look: Look, neck: Point, rear: Point, turn: number): Body {
  const { r, time } = look;
  const w = view(FRONT - turn, 0, r * LENS);
  const rings: Ring[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const x = u * DEPTH * r;
    // The lens at this depth, divided back out so the ring lands where it is meant to.
    const s = LENS / (LENS + u * DEPTH);
    const swim =
      SWIM * r * 4 * u * (1 - u) * Math.sin((time * Math.PI * 2) / SWIM_PERIOD - u * 2.5);
    const at = { x: (rear.x - neck.x) * u + swim, y: (rear.y - neck.y) * u + dive(look, u) };
    rings.push({ c: { x, y: at.y / s, z: at.x / s }, r: (r * (0.7 - 0.5 * u) * plate(i)) / s });
  }
  const frames = tubeFrames(rings);
  const side = turn3((frames[0] as Frame).b, w).z >= 0 ? 1 : -1;
  // Authored lying down, the first frame's normal is the back.
  return { rings, frames, seen: seeTube(rings, frames, w), side, upright: true, w };
}

/** The rings `frontBody` sees: what is met and what reaches. */
export function seeFrontBody(look: Look, neck: Point, rear: Point, turn: number): SeenRing[] {
  return [...frontBody(look, neck, rear, turn).seen];
}

/** The serpent's wave seen from the head end (`instar-serpent.ts`): the tube rising and
 * dipping as it goes back, the neck held where the head is so its marks do not move. */
function dive(look: Look, u: number): number {
  return swimAt(look, u) * u;
}

/** The body `frontBody` made, the far end first under everything, in the side view's hide. */
export function drawFrontBody(
  ctx: CanvasRenderingContext2D,
  look: Look,
  neck: Point,
  body: Body,
): void {
  const { r, fade, hurt, time } = look;
  const roll = rollAt(time);
  ctx.save();
  ctx.translate(neck.x, neck.y);
  drawRidge(ctx, body, r, roll, fade, true, EVERY / 2);
  const hide = drawTube(ctx, body.seen, BODY_SKIN, fade);
  strokeGlow(ctx, hide, faded(PALETTE.hull, fade), STROKE.inner, 0.5 * fade);
  drawHurt(ctx, hide, hurt * fade);
  drawBelly(ctx, body, hide, roll, fade);
  drawScales(ctx, body, hide, r * 0.1, roll, fade);
  for (let i = EVERY; i < N; i += EVERY) drawBand(ctx, body.seen, i, look);
  drawLamps(ctx, body, r, roll, time, fade, EVERY / 2);
  drawRidge(ctx, body, r, roll, fade, false, EVERY / 2);
  rimTube(ctx, hide, PALETTE.sheenRim, r * 0.05, fade);
  ctx.restore();
}

/** One plate's seam, at ring `i`. */
function drawBand(
  ctx: CanvasRenderingContext2D,
  seen: readonly SeenRing[],
  i: number,
  look: Look,
): void {
  const { fade } = look;
  const ring = seen[i] as SeenRing;
  const rad = ring.r;
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
}

/** A ring's girth by where it sits in its plate: full across the middle, pinched at the seam. */
function plate(i: number): number {
  return 1 - PINCH * (1 - Math.sin((Math.PI * (i % EVERY)) / EVERY));
}

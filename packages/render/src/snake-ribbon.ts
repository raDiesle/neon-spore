import { PALETTE } from "./palette.js";
import { ribbonPath, ribbonSides } from "./snake-contour.js";
import type { Arena } from "./snake-draw.js";
import {
  backGradient,
  castShadow,
  clearShadow,
  drawScales,
  HEAD_HALF,
  litRibbon,
  rimStroke,
  TAIL_HALF,
} from "./snake-skin.js";

/**
 * What a body looks like once somebody has said where its joints are.
 *
 * Split off `snake-body.ts` when the crawl took that file past the 250-line
 * ceiling, and the seam is the one the round already had: next door is *where*
 * the body is — the slide between two tiles, the wave it travels through, the
 * head's own heading — and here is every pass of paint over a list of points
 * that has already been decided. Nothing here reads the world, which is what
 * lets the pause after a crash hand it a body that is not on the world any
 * more (`snake-crash.ts`).
 */

/**
 * A body from a list of joints and nothing else, the whole length of it on
 * both screens.
 *
 * Exported because the pause after a crash draws a body that is not on the
 * world any more (`snake-crash.ts`): the joints it hands in are the folded-up
 * ghost, and everything about how a body is filled, lit and rimmed has to be
 * the same call or the thing that crumples will not be the thing that was
 * driving a moment ago.
 */
export function drawJointRibbon(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  joints: { x: number; y: number }[],
): void {
  if (joints.length < 2) return;
  drawLength(ctx, arena, joints);
}

/**
 * The whole length, as a tapered ribbon.
 *
 * Built as one filled contour rather than a stroked path: a stroke is the same
 * width everywhere, and the taper is half of what makes this read as an animal
 * — the other half is the spine, drawn over it. The contour is a spline and
 * not a chain of straight lines, which is the difference between an animal and
 * a six-sided polygon of one (`snake-contour.ts`).
 *
 * Four passes over that one contour, in the order light arrives: a shadow on
 * the floor, the arena's own gradient as the fill, then the scales and the lit
 * side of the back **inside a clip of it**, then the rim. The clip is what
 * lets the highlight be a shape pushed towards the light rather than a shape
 * that has to know where the body's edge is (`snake-skin.ts`).
 */
function drawLength(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  joints: { x: number; y: number }[],
): void {
  const half = bodyHalf(arena, joints.length);
  const sides = ribbonSides(joints, half);
  const path = ribbonPath(joints, sides);
  paintSkin(ctx, arena, joints, half, path);
  drawSpine(ctx, arena, joints, 0, joints.length);
}

/**
 * The passes the body is painted with: a shadow on the floor, the arena's
 * gradient as the fill, the scales and the lit side of the back inside a clip
 * of the contour, then the rim.
 */
function paintSkin(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  joints: { x: number; y: number }[],
  half: (i: number) => number,
  path: Path2D,
): void {
  castShadow(ctx, arena);
  ctx.fillStyle = backGradient(ctx, arena);
  ctx.fill(path);
  clearShadow(ctx);

  ctx.save();
  ctx.clip(path);
  drawScales(ctx, arena, joints, half);
  litRibbon(ctx, joints, half);
  ctx.restore();

  rimStroke(ctx, path);
}

/** Where the neck is narrowest, and how many joints it takes to swell out of
 * it into the body's own width. */
const NECK_HALF = 0.27;
const NECK_JOINTS = 1.5;

/**
 * How wide the body is at each of its joints.
 *
 * **There is a neck.** The width used to start at the body's own widest and
 * fall from there, which put the body's widest point flush against the back of
 * the head — and a head exactly as wide as the thing behind it does not read
 * as a head, it reads as the end of a tube. A snake is narrow behind the
 * skull and widest a body's width further back, so the ribbon pinches at the
 * first joint, swells over the next one and a half and tapers from there. The
 * head's own outline is then wholly visible, which is what makes the body
 * come out from *under* it (`snake-jaw.ts`).
 */
function bodyHalf(arena: Arena, count: number): (i: number) => number {
  const last = Math.max(1, count - 1);
  return (i) => {
    const swell = Math.min(1, i / NECK_JOINTS);
    const body = HEAD_HALF + (TAIL_HALF - HEAD_HALF) * (i / last);
    return arena.tile * (NECK_HALF + (body - NECK_HALF) * swell);
  };
}

/**
 * The markings down the back — one diamond a segment, shrinking with the body.
 *
 * The cheapest thing that turns a shape into a creature at this size, and the
 * one the reference drawing spends the most ink on. They are drawn from the
 * joints rather than from the tiles, so they slide with everything else.
 * `from` and `count` place a run of joints on the whole body, so the tail
 * alone carries the markings the whole length has at that end.
 */
function drawSpine(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  joints: { x: number; y: number }[],
  from: number,
  count: number,
): void {
  ctx.fillStyle = PALETTE.cyanRim;
  for (const [k, p] of joints.entries()) {
    const i = from + k;
    if (i === 0) continue;
    const share = 1 - i / Math.max(1, count - 1);
    const r = arena.tile * (0.06 + 0.06 * share);
    ctx.globalAlpha = 0.35 + 0.25 * share;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - r);
    ctx.lineTo(p.x + r, p.y);
    ctx.lineTo(p.x, p.y + r);
    ctx.lineTo(p.x - r, p.y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

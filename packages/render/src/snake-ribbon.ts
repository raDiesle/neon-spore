import { PALETTE } from "./palette.js";
import type { Arena } from "./snake-draw.js";
import {
  backGradient,
  castShadow,
  clearShadow,
  drawScales,
  HEAD_HALF,
  litRibbon,
  ribbonSides,
  rimStroke,
  TAIL_HALF,
  traceRibbon,
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
 * A body from a list of joints and nothing else — the whole length or the two
 * ends of it.
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
  showBody: boolean,
): void {
  if (joints.length < 2) return;
  if (showBody) drawLength(ctx, arena, joints);
  else drawEnds(ctx, arena, joints);
}

/**
 * The whole length, as a tapered ribbon.
 *
 * Built as one filled contour rather than a stroked path: a stroke is the same
 * width everywhere, and the taper is half of what makes this read as an animal
 * — the other half is the spine, drawn over it.
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
  const half = (i: number): number =>
    arena.tile * (HEAD_HALF + (TAIL_HALF - HEAD_HALF) * (i / Math.max(1, joints.length - 1)));
  const sides = ribbonSides(joints, half);

  castShadow(ctx, arena);
  traceRibbon(ctx, joints, sides);
  ctx.fillStyle = backGradient(ctx, arena);
  ctx.fill();
  clearShadow(ctx);

  ctx.save();
  traceRibbon(ctx, joints, sides);
  ctx.clip();
  drawScales(ctx, arena, joints, half);
  litRibbon(ctx, joints, half);
  ctx.restore();

  traceRibbon(ctx, joints, sides);
  rimStroke(ctx);
  drawSpine(ctx, arena, joints);
}

/**
 * The markings down the back — one diamond a segment, shrinking with the body.
 *
 * The cheapest thing that turns a shape into a creature at this size, and the
 * one the reference drawing spends the most ink on. They are drawn from the
 * joints rather than from the tiles, so they slide with everything else.
 */
function drawSpine(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  joints: { x: number; y: number }[],
): void {
  ctx.fillStyle = PALETTE.cyanRim;
  for (const [i, p] of joints.entries()) {
    if (i === 0) continue;
    const share = 1 - i / Math.max(1, joints.length - 1);
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

/**
 * The tail alone — player 1's half of the body. A short taper at the last
 * joint, so the end reads as an end and not as a segment that stopped.
 */
function drawEnds(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  joints: { x: number; y: number }[],
): void {
  const end = joints[joints.length - 1];
  const before = joints[joints.length - 2];
  if (!end || !before) return;
  const dx = end.x - before.x;
  const dy = end.y - before.y;
  const len = Math.hypot(dx, dy) || 1;
  const half = arena.tile * 0.22;
  const nx = -(dy / len) * half;
  const ny = (dx / len) * half;
  const trace = (): void => {
    ctx.beginPath();
    ctx.moveTo(before.x + nx, before.y + ny);
    ctx.lineTo(end.x + dx * 0.3, end.y + dy * 0.3);
    ctx.lineTo(before.x - nx, before.y - ny);
    ctx.closePath();
  };
  castShadow(ctx, arena);
  trace();
  ctx.fillStyle = backGradient(ctx, arena);
  ctx.fill();
  clearShadow(ctx);
  trace();
  rimStroke(ctx);
}

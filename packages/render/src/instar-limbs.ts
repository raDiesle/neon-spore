import { blobPoints } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { drawPlate, faded } from "./instar-draw.js";
import { drawClutch } from "./instar-eggs.js";
import { type Figure, instarAt, type Point } from "./instar-shape.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **What THE INSTAR holds and grows**, pose by pose: the two arms and their
 * clawed hands, the club a hand is made to drop, the clutch of eggs on the
 * flank, the tongue out and coiled, the tail's barb swung over the hull, and
 * the husk it sheds in the moult. Each is drawn *at the figure's own place
 * for it* (`instar-shape.ts`), which is the mark's place, so the red ring a
 * thumb is asked for sits on the part it moves.
 *
 * Cut from `instar-draw.ts` at the seam THE HIVE cut: the body is one file,
 * the things on it another, and the marks a third.
 */
export function drawInstarLimbs(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  f: Figure,
  head: Point,
  r: number,
  shoulders: readonly [Point, Point],
  time: number,
  fade: number,
): void {
  drawHusk(ctx, f, head, r, time, fade);
  drawTail(ctx, l, f, head, r, time, fade);
  const lHand = instarAt(l, f.lHandX, f.lHandY);
  const rHand = instarAt(l, f.rHandX, f.rHandY);
  drawArm(ctx, shoulders[0], lHand, r, -1, time, fade);
  drawArm(ctx, shoulders[1], rHand, r, 1, time, fade);
  drawClub(ctx, lHand, r, -1, f.lWeapon, fade);
  drawClub(ctx, rHand, r, 1, f.rWeapon, fade);
  drawClutch(ctx, l, f, r, time, fade);
  drawTongue(ctx, l, f, head, r, time, fade);
}

/** A jointed arm, shoulder to hand, with three claws on the hand's blob. */
function drawArm(
  ctx: CanvasRenderingContext2D,
  from: Point,
  hand: Point,
  r: number,
  side: -1 | 1,
  time: number,
  fade: number,
): void {
  const elbow = {
    x: (from.x + hand.x) / 2 + side * r * 0.35,
    y: (from.y + hand.y) / 2 - r * 0.1,
  };
  const arm = new Path2D();
  arm.moveTo(from.x, from.y);
  arm.quadraticCurveTo(elbow.x, elbow.y, hand.x, hand.y);
  strokeGlow(ctx, arm, faded(PALETTE.hull, fade), r * 0.14, 0.6 * fade);
  ctx.save();
  ctx.strokeStyle = faded(PALETTE.sheenDeep, fade, 0.9);
  ctx.lineWidth = r * 0.1;
  ctx.lineCap = "round";
  ctx.stroke(arm);
  ctx.restore();
  const palm = splinePath(
    blobPoints(hand.x, hand.y, r * 0.22, r * 0.2, 4, 0.1, 0.03, time, 20 + side, 16),
    true,
  );
  drawPlate(ctx, palm, fade, 0.7);
  // Three claws, spread down and out from the palm.
  ctx.save();
  ctx.strokeStyle = faded(PALETTE.rock, fade);
  ctx.lineWidth = STROKE.outline;
  ctx.lineCap = "round";
  for (let i = -1; i <= 1; i++) {
    const a = Math.PI / 2 + i * 0.5 + side * 0.15;
    ctx.beginPath();
    ctx.moveTo(hand.x + Math.cos(a) * r * 0.18, hand.y + Math.sin(a) * r * 0.16);
    ctx.lineTo(hand.x + Math.cos(a) * r * 0.36, hand.y + Math.sin(a) * r * 0.34);
    ctx.stroke();
  }
  ctx.restore();
}

/** A club of rock in the hand: upright while held, tipping and fading as the slaps loosen it. */
function drawClub(
  ctx: CanvasRenderingContext2D,
  hand: Point,
  r: number,
  side: -1 | 1,
  weapon: number,
  fade: number,
): void {
  if (weapon <= 0.02) return;
  ctx.save();
  ctx.translate(hand.x, hand.y);
  ctx.rotate(side * (0.3 + (1 - weapon) * 1.1));
  const len = r * 0.9;
  const club = new Path2D();
  club.moveTo(-r * 0.05, 0);
  club.lineTo(r * 0.05, 0);
  club.lineTo(r * 0.16, -len * 0.7);
  club.quadraticCurveTo(0, -len * 1.15, -r * 0.16, -len * 0.7);
  club.closePath();
  ctx.fillStyle = faded(PALETTE.rockDark, fade, weapon);
  ctx.fill(club);
  ctx.strokeStyle = faded(PALETTE.rock, fade, weapon);
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(club);
  ctx.restore();
}

/** The tongue: out of the mouth to its tip, coiling as it goes, winding back in with the turn. */
function drawTongue(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  f: Figure,
  head: Point,
  r: number,
  time: number,
  fade: number,
): void {
  if (f.tongue <= 0.02) return;
  const mouth = { x: head.x, y: head.y + r * 0.2 };
  const tip = instarAt(l, f.tongueX, f.tongueY);
  const p = new Path2D();
  p.moveTo(mouth.x, mouth.y);
  const N = 24;
  for (let i = 1; i <= N; i++) {
    const t = (i / N) * f.tongue;
    const x = mouth.x + (tip.x - mouth.x) * t;
    const y = mouth.y + (tip.y - mouth.y) * t;
    // A coil that tightens toward the tip, swaying with time.
    const coil = r * 0.14 * t;
    const a = t * Math.PI * 3 + time * 2;
    p.lineTo(x + Math.cos(a) * coil, y + Math.sin(a) * coil * 0.6);
  }
  strokeGlow(ctx, p, faded(PALETTE.sheenWarm, fade), r * 0.08, 0.7 * fade);
  ctx.save();
  ctx.strokeStyle = faded(PALETTE.sheenRim, fade, 0.6);
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(p);
  ctx.restore();
}

/** The tail: over the turned back and down to its barb, lifting away with the pull. */
function drawTail(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  f: Figure,
  head: Point,
  r: number,
  time: number,
  fade: number,
): void {
  const show = f.back * f.tail;
  if (show <= 0.02) return;
  const root = { x: head.x, y: head.y - r * 0.6 };
  const barb = instarAt(l, f.tailX, f.tailY);
  const end = { x: root.x + (barb.x - root.x) * f.tail, y: root.y + (barb.y - root.y) * f.tail };
  const swing = Math.sin(time * 1.7) * r * 0.2;
  const p = new Path2D();
  p.moveTo(root.x, root.y);
  p.bezierCurveTo(root.x + r * 1.2 + swing, root.y, end.x + r * 0.6, end.y - r * 0.4, end.x, end.y);
  strokeGlow(ctx, p, faded(PALETTE.hull, fade), r * 0.12, 0.5 * f.back * fade);
  ctx.save();
  ctx.strokeStyle = faded(PALETTE.sheenDeep, fade, 0.9 * f.back);
  ctx.lineWidth = r * 0.08;
  ctx.lineCap = "round";
  ctx.stroke(p);
  // The barb: a rock spike pointing at the hull.
  ctx.fillStyle = faded(PALETTE.rock, fade, f.back);
  ctx.beginPath();
  ctx.moveTo(end.x - r * 0.12, end.y - r * 0.05);
  ctx.lineTo(end.x + r * 0.12, end.y - r * 0.05);
  ctx.lineTo(end.x, end.y + r * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** The moult's husk: a translucent copy of the head sliding off below it. */
function drawHusk(
  ctx: CanvasRenderingContext2D,
  f: Figure,
  head: Point,
  r: number,
  time: number,
  fade: number,
): void {
  if (f.slough <= 0.02) return;
  const y = head.y + r * (0.5 + 0.4 * f.slough) + Math.sin(time * 0.9) * r * 0.05;
  const p = splinePath(blobPoints(head.x, y, r * 0.95, r * 0.7, 6, 0.08, 0.03, time, 31, 24), true);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.dim, fade, 0.2 * f.slough);
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.dim, fade), STROKE.inner, 0.35 * f.slough * fade);
}

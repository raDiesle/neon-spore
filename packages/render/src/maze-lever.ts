import { circleSubpath, type Point } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE MAZE's lever, drawn: an arm bolted to the drum's rim with a knob on
 * its end, the thing the pilot takes hold of to turn the wheel.
 *
 * Cut out of `maze-string.ts`, along the seam that file's two halves already
 * had: that one says where the handle is and how far the hand has taken it —
 * the part `touch.ts` has to agree with — and this one only paints what it is
 * handed. The owner asked for the lever by name, 25 September 2026: *a visual
 * like a lever* that joins the place to take hold to the drum, so the drum
 * turning reads as the lever's doing.
 */

/**
 * The arm, from a clamp on the rim straight out to the knob, on the spoke the
 * knob stands on — so the arm swings round the drum's own middle, and the
 * drum turning under it reads as the arm's doing.
 */
export function drawMazeLever(
  ctx: CanvasRenderingContext2D,
  d: { cx: number; cy: number; r: number },
  knob: Point,
  r: number,
  held: boolean,
): void {
  // The spoke the knob is on, as the angle off straight down to the left.
  const a = Math.atan2(d.cx - knob.x, knob.y - d.cy);
  const foot = { x: d.cx - d.r * Math.sin(a), y: d.cy + d.r * Math.cos(a) };
  const live = held ? PALETTE.text : PALETTE.hullRim;

  const arm = new Path2D();
  arm.moveTo(foot.x, foot.y);
  arm.lineTo(knob.x, knob.y);
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = r * 0.5 + STROKE.inner * 2;
  ctx.stroke(arm);
  ctx.restore();
  strokeGlow(ctx, arm, live, r * 0.3, 0.9);

  // The clamp: a plate across the spoke, on the rim, where the arm is bolted.
  const nx = Math.cos(a);
  const ny = Math.sin(a);
  const clamp = new Path2D();
  clamp.moveTo(foot.x - nx * r * 0.7, foot.y - ny * r * 0.7);
  clamp.lineTo(foot.x + nx * r * 0.7, foot.y + ny * r * 0.7);
  strokeGlow(ctx, clamp, live, r * 0.35, 1);

  const p = new Path2D(circleSubpath(knob.x, knob.y, r * 0.7));
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.fill(p);
  ctx.fillStyle = held ? PALETTE.text : PALETTE.grid;
  ctx.globalAlpha = held ? 0.9 : 0.7;
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, live, STROKE.inner, 1);
}

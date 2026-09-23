import { blobPoints } from "@neon-spore/content";
import type { CairnUnit } from "./cairn-units.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { splineInto } from "./spline.js";

/**
 * **What holds THE CAIRN together**: a slime grown through the stack. It fills
 * every seam, coats the pile a lip past its outer stones, and gathers under
 * the bottom course in a foot that hangs in strands, each ending in a drop.
 * The seams are lit, so they stay the thing a pair counts, and a wet film
 * lies high on the left of the whole pile.
 *
 * **The stones are not touched.** The owner kept the pile as seven of the
 * field's own rocks on 13 September 2026 (`tools/versus/DECIDED.md`,
 * `cairn:pile`): the boss comes apart into ordinary rocks, so the parts stay
 * ordinary rocks while they are stacked. What made the picture a heap rather
 * than a made thing was the plain grey line between them, and that line is
 * this now (`new-boss-more` §6.3).
 *
 * Violet from the sheen family, which is what a grown body up the field is
 * drawn in, so the fire of the stones and the slime between them read as two
 * materials. **Every width is off the stone's radius or the tile.**
 */

/** Strands under the bottom course, between its stones and at its ends. */
const STRANDS = 3;

/** The coat behind the stones: a lobed blob round each one and a foot under
 * the bottom course, one path so the union fills once, and the strands. */
export function drawSlimeUnder(
  ctx: CanvasRenderingContext2D,
  stack: readonly CairnUnit[],
  time: number,
): void {
  const first = stack[0];
  if (!first) return;
  const r = first.r;
  const base = stack.filter((u) => Math.abs(u.y - first.y) < r * 0.5);
  const left = Math.min(...base.map((u) => u.x));
  const right = Math.max(...base.map((u) => u.x));
  const bottom = Math.max(...base.map((u) => u.y));
  const top = Math.min(...stack.map((u) => u.y)) - r;

  const coat = new Path2D();
  for (const u of stack) {
    splineInto(
      coat,
      blobPoints(u.x, u.y, r * 1.1, r * 1.08, 5, 0.05, 0.03, time * 0.3, u.slot, 20),
      true,
    );
  }
  const footY = bottom + r * 0.55;
  splineInto(
    coat,
    blobPoints(
      (left + right) / 2,
      footY,
      (right - left) / 2 + r * 0.7,
      r * 0.5,
      4,
      0.08,
      0.04,
      time * 0.25,
      7,
      28,
    ),
    true,
  );

  ctx.save();
  ctx.fillStyle = PALETTE.sheenDeep;
  ctx.fill(coat);
  const glow = ctx.createLinearGradient(0, top, 0, footY + r * 0.5);
  glow.addColorStop(0, rgba(PALETTE.sheenCold, 0.25));
  glow.addColorStop(0.7, rgba(PALETTE.sheenMid, 0.3));
  glow.addColorStop(1, rgba(PALETTE.sheenWarm, 0.45));
  ctx.fillStyle = glow;
  ctx.fill(coat);
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.35);
  ctx.lineWidth = Math.max(1, r * 0.03);
  ctx.stroke(coat);
  ctx.restore();

  drawStrands(ctx, left, right, footY + r * 0.35, r, time);
}

/** Slime hanging off the foot, each strand stretching and letting go of its
 * drop on its own slow clock, so no two fall together. */
function drawStrands(
  ctx: CanvasRenderingContext2D,
  left: number,
  right: number,
  y: number,
  r: number,
  time: number,
): void {
  ctx.save();
  for (let i = 0; i < STRANDS; i++) {
    const x = left + ((right - left) * (i + 0.5)) / STRANDS + Math.sin(i * 2.7) * r * 0.2;
    const stretch = 0.5 + 0.5 * Math.sin(time * 0.45 + i * 2.1);
    const len = r * (0.35 + 0.55 * stretch);
    const sway = Math.sin(time * 0.8 + i * 1.3) * r * 0.06;
    const w = r * 0.12;
    const tipX = x + sway;
    const tipY = y + len;
    const drop = r * (0.08 + 0.06 * stretch);
    const strand = new Path2D();
    strand.moveTo(x - w, y - r * 0.1);
    strand.quadraticCurveTo(x - w * 0.2, y + len * 0.5, tipX - drop * 0.6, tipY);
    strand.arc(tipX, tipY, drop, Math.PI, 0, true);
    strand.quadraticCurveTo(x + w * 0.2, y + len * 0.5, x + w, y - r * 0.1);
    strand.closePath();
    ctx.fillStyle = rgba(PALETTE.sheenWarm, 0.55);
    ctx.fill(strand);
    ctx.fillStyle = rgba(PALETTE.sheenRim, 0.8);
    ctx.beginPath();
    ctx.arc(tipX - drop * 0.35, tipY - drop * 0.1, Math.max(0.6, drop * 0.3), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** The seams, inside the pile's clip: slime filling the joint, lit along its
 * middle, where a grey line was. */
export function drawSlimeSeams(ctx: CanvasRenderingContext2D, path: Path2D, tile: number): void {
  ctx.save();
  ctx.lineJoin = "round";
  ctx.strokeStyle = PALETTE.sheenDeep;
  ctx.lineWidth = Math.max(1.5, tile * 0.16);
  ctx.stroke(path);
  ctx.strokeStyle = rgba(PALETTE.sheenMid, 0.55);
  ctx.lineWidth = Math.max(1, tile * 0.07);
  ctx.stroke(path);
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.45);
  ctx.lineWidth = Math.max(0.6, tile * 0.02);
  ctx.stroke(path);
  ctx.restore();
}

/** The wet film over the whole pile, high on the left, inside its clip. */
export function drawSlimeFilm(ctx: CanvasRenderingContext2D, stack: readonly CairnUnit[]): void {
  const first = stack[0];
  if (!first) return;
  const r = first.r;
  const left = Math.min(...stack.map((u) => u.x)) - r;
  const right = Math.max(...stack.map((u) => u.x)) + r;
  const top = Math.min(...stack.map((u) => u.y)) - r;
  const bottom = Math.max(...stack.map((u) => u.y)) + r;
  const fx = left + (right - left) * 0.3;
  const fy = top + (bottom - top) * 0.3;
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.12);
  ctx.beginPath();
  ctx.ellipse(fx, fy, (right - left) * 0.14, r * 0.12, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.6);
  ctx.beginPath();
  ctx.arc(fx - (right - left) * 0.06, fy + r * 0.05, Math.max(0.8, r * 0.05), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

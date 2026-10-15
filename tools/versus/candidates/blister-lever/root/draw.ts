import type { BlisterFrame } from "../../../../../packages/render/src/blister-bodies.js";
import type { Body } from "../../../../../packages/render/src/creature-body-in.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import {
  blisterLeverDepth,
  blisterLeverHeld,
  blisterLeverInBand,
} from "../../../../../packages/sim/src/index.js";

const TAU = Math.PI * 2;

/**
 * ROOT: a turnip's shoulders and its leaves are all that stand up out of the
 * pore; the thumb pulls its root down into the field. The root runs from the
 * pore down the groove to the knob, thick at the top and thinning to its tip
 * at the knob, rootlets off it as it goes. Held in the band, the leaves stand
 * up straight and green; out of it they droop. On the partner's screen the
 * root alone says how far it has been drawn.
 */
export function drawRootBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const x = b.x;
  const y = b.y + (1 - f.rise) * r * 1.8;
  const up = blisterLeverHeld(b.c) && blisterLeverInBand(b.world, b.c);
  ctx.save();
  for (const [i, lean] of LEAVES.entries()) {
    leaf(ctx, x + lean * r * 0.3, y - r * 0.3, r, lean * (up ? 0.25 : 0.7), i, b.time);
  }
  const bulb = new Path2D();
  bulb.ellipse(x, f.poreY - r * 0.05, r * 1.15, r * 0.95, 0, Math.PI, TAU);
  const g = ctx.createLinearGradient(0, f.poreY - r, 0, f.poreY);
  g.addColorStop(0, PALETTE.hull);
  g.addColorStop(1, PALETTE.hullRim);
  ctx.fillStyle = g;
  ctx.fill(bulb);
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.9);
  ctx.stroke(bulb);
  ctx.restore();
}

/** The root, from the pore down the groove to its tip at the knob. */
export function drawRootDown(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const tip = knobY(b);
  const top = f.poreY - r * 0.1;
  const run = Math.max(r * 0.6, tip - top);
  ctx.save();
  const root = new Path2D();
  root.moveTo(b.x - r * 0.62, top);
  root.bezierCurveTo(
    b.x - r * 0.55,
    top + run * 0.4,
    b.x - r * 0.12,
    top + run * 0.8,
    b.x,
    top + run,
  );
  root.bezierCurveTo(
    b.x + r * 0.12,
    top + run * 0.8,
    b.x + r * 0.55,
    top + run * 0.4,
    b.x + r * 0.62,
    top,
  );
  root.closePath();
  const g = ctx.createLinearGradient(0, top, 0, top + run);
  g.addColorStop(0, PALETTE.hullRim);
  g.addColorStop(1, PALETTE.text);
  ctx.fillStyle = g;
  ctx.fill(root);
  ctx.lineWidth = Math.max(1.2, r * 0.08);
  ctx.strokeStyle = rgba(PALETTE.hull, 0.9);
  ctx.stroke(root);
  // Rootlets off either side, and rings where it was pulled through the soil.
  ctx.beginPath();
  for (let k = 1; k <= 4; k++) {
    const t = k / 5;
    const half = r * 0.6 * (1 - t) ** 1.4;
    const side = k % 2 === 0 ? 1 : -1;
    const ry = top + run * t;
    ctx.moveTo(b.x + side * half, ry);
    ctx.quadraticCurveTo(
      b.x + side * (half + r * 0.4),
      ry + r * 0.1,
      b.x + side * (half + r * 0.55),
      ry + r * 0.4,
    );
    ctx.moveTo(b.x - half * 0.8, ry - r * 0.15);
    ctx.lineTo(b.x + half * 0.8, ry - r * 0.15);
  }
  ctx.lineWidth = Math.max(1, r * 0.07);
  ctx.strokeStyle = rgba(PALETTE.hull, 0.8);
  ctx.stroke();
  ctx.restore();
}

/** How far each leaf leans, left of the middle to right. */
const LEAVES = [-1, -0.35, 0.35, 1] as const;

function leaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  lean: number,
  i: number,
  time: number,
): void {
  const sway = Math.sin(time * 2 + i) * 0.06;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean + sway);
  const p = new Path2D();
  p.moveTo(0, 0);
  p.bezierCurveTo(-r * 0.55, -r * 0.6, -r * 0.35, -r * 1.5, 0, -r * 1.85);
  p.bezierCurveTo(r * 0.35, -r * 1.5, r * 0.55, -r * 0.6, 0, 0);
  ctx.fillStyle = PALETTE.organ;
  ctx.fill(p);
  ctx.lineWidth = Math.max(1, r * 0.07);
  ctx.strokeStyle = rgba(PALETTE.organRim, 0.9);
  ctx.stroke(p);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -r * 1.6);
  ctx.strokeStyle = rgba(PALETTE.vein, 0.9);
  ctx.stroke();
  ctx.restore();
}

/** Where the knob stands on screen, as `blister-lever-help.ts` lays its groove. */
function knobY(b: Body): number {
  const length = (b.world.cfg.blisterLeverMilli * b.l.tile) / 1000;
  return b.y + blisterLeverDepth(b.world, b.c) * length;
}

import { bendAbout, during } from "./blister-bend.js";
import type { BlisterDying } from "./blister-death.js";
import { smoothstep } from "./ease.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * SCREW: wound all the way in. The turn keeps going after the blow, faster
 * and faster the way it was wound, and the body screws itself down into its
 * pore like a cap onto a jar, flat rings of the turn spiralling round the hole
 * as it goes.
 */
export function drawScrew(d: BlisterDying): void {
  const { ctx, x, y, r, poreY, spin } = d;
  const t = during(d.at, 0, 0.8);
  const turn = spin * Math.PI * 2 * 1.75 * t * t;
  const sink = smoothstep(during(d.at, 0.15, 0.8));
  const squeeze = 1 - 0.25 * sink;
  ctx.save();
  ctx.globalAlpha *= 1 - during(d.at, 0.8, 1);
  d.body(1 - sink, bendAbout(x, y, { turn, sx: squeeze, sy: squeeze }));
  ctx.restore();
  d.control(1 - during(d.at, 0.1, 0.45), bendAbout(x, y, { turn }));
  swirl(ctx, x, poreY, r, spin, turn, 1 - during(d.at, 0.6, 1));
}

/** Three arcs of the turn round the pore, flat on the skin, closing in. */
function swirl(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  spin: 1 | -1,
  turn: number,
  a: number,
): void {
  if (a <= 0) return;
  ctx.save();
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const reach = r * (1.6 - 0.25 * i) * (0.6 + 0.4 * a);
    const from = turn * (1 + i * 0.2) + (i * Math.PI * 2) / 3;
    ctx.beginPath();
    ctx.ellipse(x, y, reach, reach * 0.32, 0, from, from + spin * 1.6, spin < 0);
    ctx.lineWidth = r * (0.14 - 0.03 * i);
    ctx.strokeStyle = rgba(i === 0 ? PALETTE.hullRim : PALETTE.hull, 0.8 * a);
    ctx.stroke();
  }
  ctx.restore();
}

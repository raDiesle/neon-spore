import type { BlisterFrame } from "../../../../../packages/render/src/blister-bodies.js";
import type { Body } from "../../../../../packages/render/src/creature-body-in.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { blisterTurnShare, blisterTurnWayOf } from "../../../../../packages/sim/src/index.js";

const TAU = Math.PI * 2;

/** The lobes round the wheel. */
const LOBES = 6;

/**
 * WHEEL: the body is a wheel of six lobes up out of the pore, each lobe
 * hooked over at its tip the way the turn runs, so a still wheel already says
 * clockwise or not, like the blades of a turbine. The lever turns it: the
 * wheel goes round with the knob, and the hub in its middle is the lever's
 * bolt.
 */
export function drawWheelBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const x = b.x;
  const y = b.y + (1 - f.rise) * r * 1.8;
  const sign = blisterTurnWayOf(b.c) === "cw" ? 1 : -1;
  const spin = -Math.PI / 2 + sign * blisterTurnShare(b.c) * TAU;
  ctx.save();
  const wheel = new Path2D();
  for (let i = 0; i < LOBES; i++) {
    const a = spin + (i * TAU) / LOBES;
    // Each lobe: out from the hub, round its tip swept the way the turn runs.
    const lobe = new Path2D();
    const out = r * 1.5;
    const ax = x + Math.cos(a - 0.38) * r * 0.55;
    const ay = y + Math.sin(a - 0.38) * r * 0.55;
    const bx = x + Math.cos(a + 0.38) * r * 0.55;
    const by = y + Math.sin(a + 0.38) * r * 0.55;
    const tx = x + Math.cos(a + sign * 0.35) * out;
    const ty = y + Math.sin(a + sign * 0.35) * out;
    lobe.moveTo(ax, ay);
    lobe.quadraticCurveTo(
      x + Math.cos(a - sign * 0.3) * out * 1.05,
      y + Math.sin(a - sign * 0.3) * out * 1.05,
      tx,
      ty,
    );
    lobe.quadraticCurveTo(
      x + Math.cos(a + sign * 0.15) * out * 0.7,
      y + Math.sin(a + sign * 0.15) * out * 0.7,
      bx,
      by,
    );
    lobe.closePath();
    wheel.addPath(lobe);
  }
  wheel.arc(x, y, r * 0.75, 0, TAU);
  const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.6);
  g.addColorStop(0, rgba(PALETTE.hull, 0.95));
  g.addColorStop(1, rgba(PALETTE.hull, 0.5));
  ctx.fillStyle = g;
  ctx.fill(wheel, "nonzero");
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.9);
  ctx.stroke(wheel);
  // The hub.
  ctx.beginPath();
  ctx.arc(x, y, r * 0.75, 0, TAU);
  ctx.fillStyle = rgba(PALETTE.redDark, 0.9);
  ctx.fill();
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.7);
  ctx.stroke();
  ctx.restore();
}

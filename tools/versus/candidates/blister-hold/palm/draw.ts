import type { BlisterFrame } from "../../../../../packages/render/src/blister-bodies.js";
import type { Body } from "../../../../../packages/render/src/creature-body-in.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

const TAU = Math.PI * 2;

/** The fingers, fanned over the top of the drop. */
const FINGERS = 4;

/**
 * PALM: a slime hand comes up out of the pore palm up, the HOLD's drop
 * cupped in it like water — the palm under the drop, the thumb up its near
 * side and four fingers fanned up round its far side. Nobody on it, the
 * fingers stand open; under a thumb they curl in over the drop and grip it,
 * as the player's own hand is gripping it.
 */
export function drawPalmBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const x = b.x;
  const y = b.y + (1 - f.rise) * r * 1.8;
  const held = b.c.blisterHeldTicks !== undefined;
  const curl = held ? 1 : 0.15 + 0.1 * Math.sin(b.time * 2.2);
  ctx.save();
  const hand = new Path2D();
  // The palm, a cup under the drop, its heel down in the pore.
  hand.ellipse(x, y + r * 0.35, r * 1.4, r * 0.85, 0, 0, TAU);
  // The fingers: out from the palm's rim and up, curled in toward the drop as it is held.
  for (let i = 0; i < FINGERS; i++) {
    const a = -Math.PI / 2 + (i - (FINGERS - 1) / 2) * 0.5 + 0.35;
    const reach = r * (2.0 - 0.4 * curl);
    const bend = a + (a > -Math.PI / 2 ? -1 : 1) * 0.35 * curl;
    finger(hand, x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9, {
      x: x + Math.cos(bend) * reach,
      y: y + Math.sin(bend) * reach,
      w: r * 0.24,
    });
  }
  // The thumb, up the near side.
  const ta = Math.PI * (1.02 + 0.08 * curl);
  finger(hand, x - r * 1.0, y + r * 0.35, {
    x: x + Math.cos(ta) * r * (1.85 - 0.2 * curl),
    y: y + Math.sin(ta) * r * (1.85 - 0.2 * curl) - r * 0.3,
    w: r * 0.26,
  });
  // Stroked before it is filled, so the fill hides where fingers cross the palm.
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(3, r * 0.18);
  ctx.strokeStyle = rgba(PALETTE.organRim, 0.9);
  ctx.stroke(hand);
  // Opaque, or the stroke under it would show through.
  ctx.fillStyle = PALETTE.organ;
  ctx.fill(hand, "nonzero");
  ctx.restore();
}

/** One finger, a capsule from its root on the palm to its tip. */
function finger(p: Path2D, x: number, y: number, tip: { x: number; y: number; w: number }): void {
  const a = Math.atan2(tip.y - y, tip.x - x);
  const nx = -Math.sin(a) * tip.w;
  const ny = Math.cos(a) * tip.w;
  const s = new Path2D();
  s.moveTo(x + nx * 1.3, y + ny * 1.3);
  s.lineTo(tip.x + nx, tip.y + ny);
  s.arc(tip.x, tip.y, tip.w, a + Math.PI / 2, a - Math.PI / 2, true);
  s.lineTo(x - nx * 1.3, y - ny * 1.3);
  s.closePath();
  p.addPath(s);
}

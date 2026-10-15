import type { BlisterFrame } from "../../../../../packages/render/src/blister-bodies.js";
import type { Body } from "../../../../../packages/render/src/creature-body-in.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { blisterHoldShare } from "../../../../../packages/sim/src/index.js";

const TAU = Math.PI * 2;

/** The holes over the sponge, as fractions of its radius out from the drop and round it. */
const HOLES: readonly { out: number; at: number; size: number }[] = [
  { out: 1.0, at: 0.6, size: 0.12 },
  { out: 1.15, at: 0.25, size: 0.09 },
  { out: 0.95, at: -0.05, size: 0.1 },
  { out: 1.1, at: -0.4, size: 0.13 },
  { out: 0.9, at: -0.75, size: 0.09 },
  { out: 1.2, at: -1.0, size: 0.1 },
  { out: 1.0, at: -1.35, size: 0.12 },
  { out: 1.15, at: -1.75, size: 0.08 },
  { out: 0.95, at: -2.1, size: 0.11 },
  { out: 1.1, at: -2.5, size: 0.1 },
  { out: 0.92, at: -2.85, size: 0.09 },
  { out: 1.2, at: 2.9, size: 0.08 },
];

/**
 * SPONGE: a soft yellow sponge comes up out of the pore, holes all over it,
 * the HOLD's drop sitting in a hollow on its top. Under a thumb it gives a
 * little and drinks: the wet spreads out through it from the drop as the
 * hold fills, darkening it, and it dries as soon as it is let go.
 */
export function drawSpongeBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const x = b.x;
  const y = b.y + (1 - f.rise) * r * 1.8;
  const held = b.c.blisterHeldTicks !== undefined;
  const wet = held ? blisterHoldShare(b.world, b.c) : 0;
  const squash = held ? 0.92 : 1;
  ctx.save();
  const sponge = new Path2D();
  sponge.ellipse(x, y + r * 0.2, r * 1.9, r * 1.6 * squash, 0, 0, TAU);
  ctx.fillStyle = PALETTE.lamp;
  ctx.fill(sponge);
  // The wet, out from the drop through the sponge.
  if (wet > 0) {
    ctx.save();
    ctx.clip(sponge);
    const g = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * (0.7 + 1.5 * wet));
    g.addColorStop(0, rgba(PALETTE.ember, 0.85));
    g.addColorStop(1, rgba(PALETTE.ember, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r * 2, y - r * 2, r * 4, r * 4);
    ctx.restore();
  }
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.strokeStyle = rgba(PALETTE.emberRim, 0.9);
  ctx.stroke(sponge);
  ctx.fillStyle = rgba(PALETTE.podDark, 0.75);
  for (const h of HOLES) {
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(h.at) * r * h.out * 1.5,
      y + r * 0.2 + Math.sin(h.at) * r * h.out * 1.3 * squash,
      r * h.size * 1.9,
      r * h.size * 1.5,
      0,
      0,
      TAU,
    );
    ctx.fill();
  }
  ctx.restore();
}

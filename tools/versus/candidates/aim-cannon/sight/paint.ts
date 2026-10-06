import { circleSubpath } from "../../../../../packages/content/src/shapes.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import type { SeatSkin } from "../../../../../packages/render/src/seat-skin.js";

/** How much bigger than the reading's ring this mark is drawn, and how far it then reaches in that ring's radius (`AIM_LOOK.reach`). */
const SCALE = 1.3;
export const REACH = 3.05;

/** Of the ring's radius: where a tick starts and stops, the brackets' corner and arm, the turning ring. */
const TICK_OUT = 1.75;
const TICK_IN = 0.45;
const CORNER = 2.1;
const ARM = 0.7;
const SPIN_R = 1.35;
const DASHES = 8;

/** The crosshair in the cannon's colour, bracketed by it, a dashed ring turning round it. */
export function paintSight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ring: number,
  k: number,
  time: number,
  skin: SeatSkin,
): void {
  const r = ring * SCALE;
  const cross = new Path2D(circleSubpath(x, y, r));
  for (let q = 0; q < 4; q++) {
    const dx = Math.cos((q * Math.PI) / 2);
    const dy = Math.sin((q * Math.PI) / 2);
    cross.moveTo(x + dx * r * TICK_OUT, y + dy * r * TICK_OUT);
    cross.lineTo(x + dx * r * TICK_IN, y + dy * r * TICK_IN);
  }
  strokeGlow(ctx, cross, skin.tint, 2, 1.4 * k);
  const brackets = new Path2D();
  const c = r * CORNER;
  const a = r * ARM;
  for (const [sx, sy] of [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ] as const) {
    brackets.moveTo(x + sx * c, y + sy * (c - a));
    brackets.lineTo(x + sx * c, y + sy * c);
    brackets.lineTo(x + sx * (c - a), y + sy * c);
  }
  strokeGlow(ctx, brackets, skin.tint, 2.4, 1.2 * k);
  const spin = new Path2D();
  const turn = time * 0.9;
  const sweep = (Math.PI * 2) / DASHES;
  for (let i = 0; i < DASHES; i++) {
    const a0 = turn + i * sweep;
    spin.moveTo(x + Math.cos(a0) * r * SPIN_R, y + Math.sin(a0) * r * SPIN_R);
    spin.arc(x, y, r * SPIN_R, a0, a0 + sweep * 0.45);
  }
  strokeGlow(ctx, spin, skin.tint, 1.2, 0.8 * k, 0.75);
  const dot = new Path2D(circleSubpath(x, y, Math.max(1.2, r * 0.09)));
  ctx.fillStyle = skin.rim;
  ctx.globalAlpha = k;
  ctx.fill(dot);
  ctx.globalAlpha = 1;
}

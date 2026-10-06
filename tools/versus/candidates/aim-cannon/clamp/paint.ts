import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import type { SeatSkin } from "../../../../../packages/render/src/seat-skin.js";

/** How much bigger than the reading's ring this mark is drawn, and how far it then reaches in that ring's radius (`AIM_LOOK.reach`). */
const SCALE = 1.3;
export const REACH = 2.85;

/** Of the ring's radius: the arrowheads' nearest and farthest tip, their length and half-width, the diamond. */
const NEAR = 0.9;
const FAR = 1.35;
const LONG = 0.75;
const HALF = 0.5;
const DIAMOND = 0.42;

/** Four arrowheads closing in from the corners, round a diamond, all in the cannon's colour. */
export function paintClamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ring: number,
  k: number,
  time: number,
  skin: SeatSkin,
): void {
  const r = ring * SCALE;
  // In fast, out slow: a grab, then the hand easing off.
  const s = (Math.sin(time * 4.4) + 1) / 2;
  const d = r * (NEAR + (FAR - NEAR) * s * s);
  const heads = new Path2D();
  for (let q = 0; q < 4; q++) {
    const a = Math.PI / 4 + (q * Math.PI) / 2;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    const tip = [x + ux * d, y + uy * d] as const;
    const back = d + r * LONG;
    const notch = d + r * LONG * 0.62;
    heads.moveTo(tip[0], tip[1]);
    heads.lineTo(x + ux * back - uy * r * HALF, y + uy * back + ux * r * HALF);
    heads.lineTo(x + ux * notch, y + uy * notch);
    heads.lineTo(x + ux * back + uy * r * HALF, y + uy * back - ux * r * HALF);
    heads.closePath();
  }
  ctx.globalAlpha = 0.25 + 0.75 * k;
  ctx.fillStyle = skin.tint;
  ctx.fill(heads);
  ctx.globalAlpha = 1;
  strokeGlow(ctx, heads, skin.tint, 1.4, 1.3 * k);
  const dia = new Path2D();
  const m = r * DIAMOND;
  dia.moveTo(x, y - m);
  dia.lineTo(x + m, y);
  dia.lineTo(x, y + m);
  dia.lineTo(x - m, y);
  dia.closePath();
  strokeGlow(ctx, dia, skin.tint, 1.8, 1.2 * k);
}

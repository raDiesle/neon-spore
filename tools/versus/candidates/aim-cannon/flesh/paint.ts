import { blobPath, circleSubpath } from "../../../../../packages/content/src/shapes.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import type { SeatSkin } from "../../../../../packages/render/src/seat-skin.js";

/** How much bigger than the reading's ring this mark is drawn, and how far it then reaches in that ring's radius (`AIM_LOOK.reach`). */
const SCALE = 1.25;
export const REACH = 3.35;

/** Of the ring's radius: the slime's outer reach, the hole, how deep a lobe goes. */
const OUTER = 1.7;
const HOLE = 0.95;
const DEPTH = 0.22;

/** A ring of the ship's flesh round the target, in its body colours, rimmed in the cannon's. */
export function paintFlesh(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ring: number,
  k: number,
  time: number,
  skin: SeatSkin,
): void {
  const r = ring * SCALE;
  const swell = r * OUTER * (1 + 0.06 * Math.sin(time * 2.2));
  const outer = blobPath(x, y, swell, swell, 4, DEPTH, 0.05, time * 1.3, 0, 48);
  const hole = circleSubpath(x, y, r * HOLE);
  const slime = new Path2D(`${outer} ${hole}`);
  const [lit, mid, deep] = skin.hull.body;
  const g = ctx.createRadialGradient(x, y - r * 0.4, r * HOLE, x, y, r * OUTER);
  g.addColorStop(0, lit);
  g.addColorStop(0.45, mid);
  g.addColorStop(1, deep);
  ctx.globalAlpha = 0.4 + 0.3 * k;
  ctx.fillStyle = g;
  ctx.fill(slime, "evenodd");
  ctx.globalAlpha = 1;
  strokeGlow(ctx, new Path2D(outer), skin.tint, 2, 1.4 * k);
  strokeGlow(ctx, new Path2D(hole), skin.hull.edge, 1, 0.8 * k);
  // Four ticks of the cannon's colour from the lobes into the hole.
  const ticks = new Path2D();
  for (let q = 0; q < 4; q++) {
    const dx = Math.cos((q * Math.PI) / 2);
    const dy = Math.sin((q * Math.PI) / 2);
    ticks.moveTo(x + dx * r * HOLE, y + dy * r * HOLE);
    ticks.lineTo(x + dx * r * 0.45, y + dy * r * 0.45);
  }
  strokeGlow(ctx, ticks, skin.tint, 2, 1.2 * k);
}

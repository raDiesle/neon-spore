import type { StrikeFrame } from "./boss-strike-look.js";
import { sinHash } from "./hash.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **THE MOTH's own blow at the hull** (`boss-strike-look.ts`): it has sunk
 * all the way onto the cannon, its legs already reaching down for it in
 * sight (`moth-body.ts`), and it lands. A cloud of its scales comes down the
 * column with it, and where it lands its six claws rake the skin, three a
 * side, and the scales settle on the plating as the scratches fade.
 *
 * The scales' scatter is fixed per index, so the cloud does not crawl.
 */

/** Scales in the cloud, and how far they spread across the column, in tiles. */
const SCALES = 16;
const SPREAD = 0.9;

export function mothBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  const fall = 1 - (1 - f.reach) ** 2;
  ctx.save();
  // The scales, coming down with it and settling on the skin.
  for (let i = 0; i < SCALES; i++) {
    const lag = 0.25 * sinHash(0, i);
    const k = Math.max(0, Math.min(1, (fall - lag) / (1 - lag)));
    const sway = Math.sin(k * 7 + i) * tile * 0.15;
    const x = to.x + (sinHash(0, i + 40) * 2 - 1) * SPREAD * tile * (0.4 + 0.6 * k) + sway;
    const y = from.y + (to.y - from.y) * k - tile * 0.1 * sinHash(0, i + 80);
    ctx.globalAlpha = 0.75 * fade;
    ctx.fillStyle = i % 3 === 0 ? PALETTE.hullRim : PALETTE.dim;
    ctx.beginPath();
    ctx.ellipse(x, y, tile * 0.06, tile * 0.035, k * 4 + i, 0, Math.PI * 2);
    ctx.fill();
  }
  if (f.after > 0) {
    // Six claws, three a side, raked down and out across the skin.
    ctx.lineCap = "round";
    ctx.strokeStyle = rgba(PALETTE.red, 0.9 * fade);
    ctx.lineWidth = tile * 0.07;
    ctx.beginPath();
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const x0 = to.x + side * tile * (0.15 + i * 0.16);
        const y0 = to.y - tile * (0.12 - i * 0.04);
        const len = tile * (0.3 + 0.1 * i) * Math.min(1, f.after * 4);
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(
          x0 + side * len * 0.5,
          y0 + len * 0.4,
          x0 + side * len,
          y0 + len * 0.6,
        );
      }
    }
    ctx.stroke();
    // And the dust it lands in, spreading flat along the plating.
    ctx.strokeStyle = rgba(PALETTE.dim, 0.7 * fade);
    ctx.lineWidth = tile * 0.08;
    ctx.beginPath();
    ctx.ellipse(
      to.x,
      to.y,
      tile * (0.5 + 1.4 * f.after),
      tile * (0.1 + 0.25 * f.after),
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();
}

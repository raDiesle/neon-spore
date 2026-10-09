import { sinHash } from "./hash.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import type { SprayDraw } from "./surge-spray.js";

/** How many gobs the bulb throws. */
const GOBS = 26;
/** How far above the line from the bulb to its landing a gob arcs, in tiles. */
const LOFT = 2.2;

/** A fixed scatter per gob, so the same burst lands in the same places twice. */
const scatter = (i: number, k: number) => sinHash(i, k);

/**
 * SPLATTER — the burst sprays the whole ship. Gobs of the bulb fly out of it
 * on arcs to every column of the field, wall to wall, and land on the hull
 * as splats that sag and fade over the spray's beats: the design's "the
 * burst sprays the ship", where the game throws three gums down its own
 * columns. The gums still fall as they do; this is only the picture around
 * them, on both screens, because a burst is said to both seats already.
 */
export function paintSplatter(d: SprayDraw): void {
  const { ctx, l, x, y, age } = d;
  const t = l.tile;
  ctx.save();
  for (let i = 0; i < GOBS; i++) {
    const land = 0.18 + 0.22 * scatter(i, 1);
    const tx = l.gridLeft + ((i + 0.2 + 0.6 * scatter(i, 2)) / GOBS) * l.gridWidth;
    const ty = l.hullY - t * 0.05;
    const r = t * (0.13 + 0.12 * scatter(i, 3));
    if (age < land) {
      // In the air: a gob on a parabola, stretched along its flight.
      const u = age / land;
      const px = x + (tx - x) * u;
      const py = y + (ty - y) * u - LOFT * t * 4 * u * (1 - u);
      const vx = tx - x;
      const vy = ty - y - LOFT * t * 4 * (1 - 2 * u);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(Math.atan2(vy, vx));
      ctx.fillStyle = rgba(PALETTE.hull, 0.95);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.7, r * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = rgba(PALETTE.hullRim, 0.8);
      ctx.lineWidth = t * 0.04;
      ctx.stroke();
      ctx.restore();
      continue;
    }
    // On the hull: a splat that spreads, sags a drip, and fades.
    const since = (age - land) / (1 - land);
    const fade = 1 - since * since;
    const w = r * (1.8 + 1.2 * Math.min(1, since * 4));
    ctx.fillStyle = rgba(PALETTE.hull, 0.9 * fade);
    ctx.strokeStyle = rgba(PALETTE.hullRim, 0.75 * fade);
    ctx.lineWidth = t * 0.035;
    ctx.beginPath();
    ctx.ellipse(tx, ty, w, r * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    const drip = r * (0.8 + 2.4 * since) * scatter(i, 4);
    ctx.beginPath();
    ctx.ellipse(
      tx + w * (scatter(i, 5) - 0.5),
      ty + drip * 0.6,
      r * 0.3,
      drip * 0.6,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    for (let k = 0; k < 2; k++) {
      const side = k === 0 ? -1 : 1;
      ctx.beginPath();
      ctx.arc(
        tx + side * w * (1.3 + 0.4 * scatter(i, 6 + k)),
        ty - r * 0.5,
        r * 0.4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  ctx.restore();
}

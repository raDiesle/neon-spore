import type { StrikeFrame } from "./boss-strike-look.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { plumbSacBottom, plumbSacPath } from "./plumb-shape.js";

/**
 * **THE PLUMB's own blow at the hull** (`boss-strike-look.ts`). A fire step
 * ran out with the core unshot (`plumb-step.ts`'s `miss`), so the bob lets
 * its plumb line out. Out of the sac's low end a small bob of its own, THE
 * WEIGHT's sac again (`plumbSacPath`), its narrow end pointing down, drops on a taut line straight down the middle column, which is the
 * line the whole fight is read against. It falls as a weight falls, slow off
 * the sac and fast at the skin, strikes point first, and is reeled back up.
 */

/** The small bob's size, as a share of the sac. */
const BOB = 0.4;
/** The brass point under it, in tiles past the sac's low end. */
const POINT = 0.35;

export function plumbBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { l, from, to, tile, time } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  const low = plumbSacBottom(l) * BOB;
  const tip = low + POINT * tile;
  // Dropped: slow off the sac and fast at the skin; reeled back once it has struck.
  const fall = f.after === 0 ? f.reach * f.reach : 1 - f.after * f.after;
  const bobY = from.y + (to.y - tip - from.y) * fall;
  ctx.save();
  // The plumb line, taut from the sac's low end to the bob.
  ctx.strokeStyle = rgba(PALETTE.plumbGlass, 0.7 * fade);
  ctx.lineWidth = tile * 0.035;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, bobY);
  ctx.stroke();
  // The bob, which strikes point first as the sac hangs.
  ctx.save();
  ctx.translate(to.x, bobY);
  ctx.scale(BOB, BOB);
  const bob = plumbSacPath(l, 1, time);
  ctx.fillStyle = rgba(PALETTE.plumbBronzeDark, 0.95 * fade);
  ctx.fill(bob);
  ctx.strokeStyle = rgba(PALETTE.plumbBronze, fade);
  ctx.lineWidth = (tile * 0.06) / BOB;
  ctx.stroke(bob);
  ctx.restore();
  // Its point, the part that goes in.
  ctx.fillStyle = rgba(PALETTE.plumbBronze, fade);
  ctx.beginPath();
  ctx.moveTo(to.x - tile * 0.1, bobY + low - tile * 0.12);
  ctx.lineTo(to.x + tile * 0.1, bobY + low - tile * 0.12);
  ctx.lineTo(to.x, bobY + tip);
  ctx.closePath();
  ctx.fill();
  if (f.after > 0) {
    // Where the point went in: a bronze dent, and the ring the blow ran out in.
    ctx.fillStyle = rgba(PALETTE.plumbBronzeDark, 0.9 * fade);
    ctx.beginPath();
    ctx.ellipse(to.x, to.y, tile * 0.26, tile * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgba(PALETTE.plumbBronze, 0.8 * fade);
    ctx.lineWidth = tile * 0.07;
    ctx.beginPath();
    ctx.ellipse(
      to.x,
      to.y,
      tile * (0.5 + 1.5 * f.after),
      tile * (0.12 + 0.22 * f.after),
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();
}

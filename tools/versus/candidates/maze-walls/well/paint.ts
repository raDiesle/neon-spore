import { rgba } from "../../../../../packages/render/src/hex.js";
import type { MazeBreakup } from "../../../../../packages/render/src/maze-fall.js";
import { drawMazeWalls } from "../../../../../packages/render/src/maze-walls.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import {
  type MazeWheel,
  mazeCircleMilli,
  type SimConfig,
} from "../../../../../packages/sim/src/index.js";

/**
 * The paint WELL is made of.
 *
 * `drawMazeWalls` is called, and it is called **last**: every line the drum has
 * comes out of `wheel`, which is the same `walls` and `openings` the route was
 * solved from, and a look that redrew them could open a way in that is not
 * there. What this file adds is what goes *under* them — a floor for each
 * corridor, darker the further in it is — so the geometry is untouched and the
 * only new thing on the screen is the space between the lines.
 */

/** How dark the outermost corridor's floor is, and the innermost. A well, not
 * a hole: the middle still has to read as somewhere to arrive at, and
 * `maze-heart.ts` draws what is there. */
const OUTER = 0.1;
const INNER = 0.62;

/** How far the rim's own shadow reaches inward, as a share of the drum's
 * radius. It is the lip of the well, and it is what separates the outermost
 * corridor from the field behind the drum. */
const LIP = 0.06;

export function well(
  ctx: CanvasRenderingContext2D,
  drum: { cx: number; cy: number; r: number },
  wheel: MazeWheel,
  angleMilli: number,
  breakup: MazeBreakup,
  _cfg: SimConfig,
): void {
  const { cx, cy, r } = drum;

  // The floors, outermost first, each one a filled annulus between two of the
  // sheet's own circles. Drawn back to front so a deeper one lies over the
  // shallower one it sits inside, which is what makes the stack read as a
  // stack rather than as a set of rings.
  ctx.save();
  for (let k = wheel.rings; k >= 1; k--) {
    const outer = (r * mazeCircleMilli(wheel, k)) / 1000;
    const depth = 1 - (k - 1) / Math.max(1, wheel.rings - 1);
    ctx.fillStyle = rgba(PALETTE.background, OUTER + (INNER - OUTER) * depth);
    ctx.beginPath();
    ctx.arc(cx, cy, outer, 0, Math.PI * 2);
    ctx.fill();
  }

  // The lip: a band of shadow just inside the rim, which is the one edge that
  // says the whole drum is sunk into the screen rather than lying on it.
  const lip = ctx.createRadialGradient(cx, cy, r * (1 - LIP * 2), cx, cy, r);
  lip.addColorStop(0, rgba(PALETTE.background, 0));
  lip.addColorStop(1, rgba(PALETTE.background, 0.5));
  ctx.fillStyle = lip;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawMazeWalls(ctx, drum, wheel, angleMilli, breakup);
}

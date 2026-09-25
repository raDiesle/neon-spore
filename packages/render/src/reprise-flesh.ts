import type { Point } from "@neon-spore/content";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { splineSealed } from "./spline.js";

/**
 * **What THE REPRISE's torn edge is made of** (`new-boss-more` §6.3): a lip
 * with body, thick where it was torn least and thinned to nothing at the
 * flared tips, and ragged along its underside where it gave. The sac that
 * hangs through it is `reprise-body.ts`.
 *
 * Nothing here is a body's colour and nothing moves sideways, for
 * `reprise-draw.ts`'s reasons. **Every width is off the tile.**
 */

/** How thick the lip is where it is thickest, in tiles. */
const LIP = 0.18;

/** The lip under the tear's own stroke: a band from `tear` down, tapered to
 * the tips and ragged on its underside. */
export function drawTearLip(
  ctx: CanvasRenderingContext2D,
  tear: readonly Point[],
  px: number,
  tile: number,
  open: boolean,
): void {
  const first = tear[0];
  const last = tear[tear.length - 1];
  if (!first || !last) return;
  const span = last.x - px;
  const thick = tile * LIP * (open ? 1 : 0.6);
  const under: Point[] = [];
  const N = 14;
  for (let i = N - 1; i >= 1; i--) {
    const x = first.x + ((last.x - first.x) * i) / N;
    const from = Math.abs(x - px) / span;
    // Ragged only out past the sac, where it shows.
    const rag = from > 0.45 ? 1 + 0.5 * Math.sin(i * 2.9) : 1;
    under.push({ x, y: topAt(tear, x) + thick * (1 - from * from) * rag });
  }
  const lip = splineSealed([...tear, ...under]);
  const g = ctx.createLinearGradient(0, first.y, 0, topAt(tear, px) + thick);
  g.addColorStop(0, rgba(PALETTE.rock, 0.55));
  g.addColorStop(1, rgba(PALETTE.rockDark, 0.95));
  ctx.fillStyle = g;
  ctx.fill(lip);
}

/** The tear's y at `x`, straight between its points: close enough to the
 * spline through them for the underside of a band a tenth of a tile thick. */
function topAt(tear: readonly Point[], x: number): number {
  for (let i = 1; i < tear.length; i++) {
    const a = tear[i - 1];
    const b = tear[i];
    if (!a || !b || x > b.x) continue;
    const f = b.x === a.x ? 0 : (x - a.x) / (b.x - a.x);
    return a.y + (b.y - a.y) * f;
  }
  return tear[tear.length - 1]?.y ?? 0;
}

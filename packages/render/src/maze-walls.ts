import {
  MAZE_TURN,
  type MazeWheel,
  mazeCenterMilli,
  mazeCircleMilli,
  mazeRadiusMilli,
  type SimConfig,
} from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE MAZE's walls: the circles, the gaps cut in them, and the radial walls
 * that make the corridors turn.
 *
 * Its own file rather than a fifth section of `maze-draw.ts`, which was past
 * the ceiling `CLAUDE.md` sets, and along the seam that was already there:
 * this one is the drum standing still — where it hangs, how big it is, and
 * every wall in it — and knows nothing about a shot, a mouth or a string.
 *
 * **Every line here comes out of `wheel`.** The old picture drew evenly spaced
 * circles and nothing else, which is why the boss looked like a target rather
 * than a maze; these are the same `walls` and `openings` the route was solved
 * from, so a corridor drawn open is a corridor the shot may use and one drawn
 * shut is one it may not. There is no second copy of the geometry to drift.
 *
 * **Angles run the simulation's way**, zero pointing down at the ship and
 * rising as `mazeSinMilli` rises. Canvas measures from the +x axis the other
 * way round, so the one conversion is `mazeCanvasAngle` below, and everything
 * that draws on one of these circles calls it rather than writing it again.
 */

/** How far the rim sits below the top of the field, in tiles. */
const CLEAR_TILES = 0.6;

/**
 * The wheel's centre and rim, in pixels, from the numbers the simulation uses.
 * Exported because `maze-string.ts` hangs the handle off the bottom of it and
 * `touch.ts` answers a press there — three files, one circle.
 */
export function mazeDrum(l: Layout, cfg: SimConfig): { cx: number; cy: number; r: number } {
  const r = (mazeRadiusMilli(cfg) * l.tile) / 1000;
  return {
    cx: l.gridLeft + (mazeCenterMilli(cfg) * l.tile) / 1000,
    cy: l.gridTop + r + l.tile * CLEAR_TILES,
    r,
  };
}

/**
 * The simulation's angle as canvas measures it. `x = sin`, `y = cos`.
 *
 * Exported because the trail behind the shot is drawn in arcs of the same
 * circles, in `maze-shot.ts`: one conversion between the drum's frame and the
 * canvas's, called twice, rather than two of them to disagree.
 */
export function mazeCanvasAngle(angleMilli: number): number {
  return Math.PI / 2 - (angleMilli / MAZE_TURN) * Math.PI * 2;
}
const phi = mazeCanvasAngle;

/**
 * Half an opening at a given radius, as an angle. Every gap on the sheet is
 * the same *arc* wherever it is cut, so the angle it takes up grows as the
 * circle shrinks — which is why this is worked out per circle rather than
 * stored per ring.
 */
function halfGapMilli(radiusPx: number, openPx: number): number {
  if (radiusPx <= 0) return MAZE_TURN / 2;
  return Math.min(MAZE_TURN / 2, (openPx * MAZE_TURN) / (4 * Math.PI * radiusPx));
}

/**
 * The whole drum as the sheet has it: every circle broken where the sheet
 * breaks it, every radial wall where the sheet stands one, and the middle
 * filled so it reads as somewhere to arrive rather than as one more ring.
 */
export function drawMazeWalls(
  ctx: CanvasRenderingContext2D,
  drum: { cx: number; cy: number; r: number },
  wheel: MazeWheel,
  angleMilli: number,
): void {
  const { cx, cy, r } = drum;
  const openPx = (r * wheel.openMilli) / 1000;
  const radiusOf = (k: number) => (r * mazeCircleMilli(wheel, k)) / 1000;

  ctx.beginPath();
  ctx.arc(cx, cy, radiusOf(0), 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.grid;
  ctx.fill();

  for (let k = 0; k <= wheel.rings; k++) {
    const rim = k === wheel.rings;
    ctx.strokeStyle = rim ? PALETTE.hullRim : PALETTE.hull;
    ctx.lineWidth = rim ? 2.4 : 1.6;
    circle(ctx, cx, cy, radiusOf(k), wheel.openings[k] ?? [], openPx, angleMilli);
  }

  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = 1.6;
  for (let k = 1; k <= wheel.rings; k++) {
    const inner = radiusOf(k - 1);
    const outer = radiusOf(k);
    for (const wall of wheel.walls[k] ?? []) {
      const p = phi(angleMilli + wall);
      ctx.beginPath();
      ctx.moveTo(cx + inner * Math.cos(p), cy + inner * Math.sin(p));
      ctx.lineTo(cx + outer * Math.cos(p), cy + outer * Math.sin(p));
      ctx.stroke();
    }
  }
}

/** One circle, with a gap left at each of its openings and wall everywhere else. */
function circle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  openings: readonly number[],
  openPx: number,
  angleMilli: number,
): void {
  if (openings.length === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }
  const half = halfGapMilli(radius, openPx);
  for (const [i, open] of openings.entries()) {
    const after = openings[(i + 1) % openings.length] ?? open;
    const from = angleMilli + open + half;
    const to = angleMilli + (after > open ? after : after + MAZE_TURN) - half;
    if (to <= from) continue;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, phi(from), phi(to), true);
    ctx.stroke();
  }
}

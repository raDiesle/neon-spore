import { rgba } from "../../../../../packages/render/src/hex.js";
import type { MazeBreakup } from "../../../../../packages/render/src/maze-fall.js";
import { drawMazeWalls, mazeCanvasAngle } from "../../../../../packages/render/src/maze-walls.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import {
  type MazeWheel,
  mazeCircleMilli,
  type SimConfig,
} from "../../../../../packages/sim/src/index.js";

/**
 * The paint RAIL is made of.
 *
 * The opposite half of the same question from WELL next door. That one darkens
 * the *space* between the circles and leaves every line alone; this one leaves
 * the space alone and gives the **radial walls** a thickness, so a corridor has
 * sides you can see rather than a hairline you infer.
 *
 * `drawMazeWalls` is called first here rather than last, because what this adds
 * stands on top of the lines rather than under them — and either way the
 * geometry is the sheet's own. Nothing in this file decides where a wall is:
 * `wheel.walls` is read, the same array the route was solved from.
 */

/** How thick a radial wall is drawn, as a share of the drum's radius. Small:
 * a wall wide enough to measure would narrow the corridor the shot has to use,
 * and the pair reads the corridor, not the wall. */
const THICK = 0.016;

/** How bright the lit side of a wall is, and how dark the other. The light is
 * one direction for the whole drum and never per wall — six surfaces each free
 * to pick an angle is the mistake an eye reads as wrong without being able to
 * say why (`content/light.ts`). */
const LIT = 0.55;
const DARK = 0.45;

/** How far along a wall the cap at its outer end reaches, as a share of the
 * wall's own length. It is the top of the post, and it is what says the wall
 * stands up out of the floor rather than being painted on it. */
const CAP = 0.14;

export function rail(
  ctx: CanvasRenderingContext2D,
  drum: { cx: number; cy: number; r: number },
  wheel: MazeWheel,
  angleMilli: number,
  breakup: MazeBreakup,
  _cfg: SimConfig,
): void {
  drawMazeWalls(ctx, drum, wheel, angleMilli, breakup);

  const { cx, cy, r } = drum;
  const half = r * THICK;
  ctx.save();
  ctx.lineCap = "butt";
  for (let k = 1; k <= wheel.rings; k++) {
    const inner = (r * mazeCircleMilli(wheel, k - 1)) / 1000;
    const outer = (r * mazeCircleMilli(wheel, k)) / 1000;
    for (const wall of wheel.walls[k] ?? []) {
      const p = mazeCanvasAngle(angleMilli + wall);
      const ux = Math.cos(p);
      const uy = Math.sin(p);
      // The wall's own two faces, one either side of the line the sheet draws.
      // Which of them is lit follows from the wall's bearing against the key,
      // so a wall pointing up and left is bright on its upper face and one
      // pointing down and right is bright on its lower — and the whole drum
      // agrees, which is the thing that makes it read as one solid object.
      const nx = -uy;
      const ny = ux;
      const face = nx * -Math.SQRT1_2 + ny * -Math.SQRT1_2;
      for (const side of [1, -1] as const) {
        const value = side * face > 0 ? LIT : DARK;
        ctx.strokeStyle = rgba(side * face > 0 ? PALETTE.text : PALETTE.background, value);
        ctx.lineWidth = half;
        ctx.beginPath();
        ctx.moveTo(
          cx + ux * inner + nx * half * side * 0.5,
          cy + uy * inner + ny * half * side * 0.5,
        );
        ctx.lineTo(
          cx + ux * outer + nx * half * side * 0.5,
          cy + uy * outer + ny * half * side * 0.5,
        );
        ctx.stroke();
      }
      // The post's cap, at the outer end, where a corridor meets the ring it
      // is cut through. It is the mark a pair actually navigates by: the end
      // of a wall is the corner they have to get round.
      ctx.strokeStyle = rgba(PALETTE.hullRim, 0.7);
      ctx.lineWidth = half * 1.6;
      ctx.beginPath();
      ctx.moveTo(
        cx + ux * (outer - (outer - inner) * CAP),
        cy + uy * (outer - (outer - inner) * CAP),
      );
      ctx.lineTo(cx + ux * outer, cy + uy * outer);
      ctx.stroke();
    }
  }
  ctx.restore();
}

import { type MazeWheel, mazeCircleMilli } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import { mazeCanvasAngle } from "./maze-walls.js";
import { PALETTE } from "./palette.js";

/**
 * THE MAZE's drum given depth: a floor under every corridor, and a wall that
 * stands on it.
 *
 * **Two answers to one question, taken together.** These were `maze:walls` /
 * `well` and `maze:walls` / `rail` on the ALTERNATIVES page, and they were
 * written as deliberate opposites — one darkens the *space* between the lines
 * and leaves every stroke alone, the other leaves the space alone and gives
 * the radial walls a thickness. Each said in its own card that the pair could
 * not both be right about where an eye should go on a turning drum. The owner
 * looked at them on 9 September 2026 and took both, which is the answer
 * neither had argued for and is the better one: a floor with nothing standing
 * on it is a stack of discs, and a post with no floor under it is a mark
 * floating on the field. Together they are one room.
 *
 * **Not one line of the geometry moves.** `maze-look.ts` calls the floors,
 * then `drawMazeWalls`, then the posts — so every circle, every gap and every
 * radial wall is still the sheet's own, read off the same `wheel` the route
 * was solved from. A look that redrew them could open a way in that is not
 * there, which is not a look but a lie about the round (`maze-look.ts`).
 *
 * **What to watch for, because both cards named it.** The thing a pair is
 * actually hunting on this wheel is an *absence* — a break in a circle — and
 * both halves of this make the wheel busier. If openings that are plainly
 * there start being missed, the floors are the first suspect: a boundary
 * where the value changes sits at exactly the circle a gap is cut in. If the
 * drum starts feeling like something to study rather than read, it is the
 * caps, which are the brightest new marks on it.
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

/**
 * The floors, under everything.
 *
 * Outermost first, each one a filled annulus between two of the sheet's own
 * circles, drawn back to front so a deeper one lies over the shallower one it
 * sits inside — which is what makes the stack read as a stack rather than as a
 * set of rings. Then the lip: a band of shadow just inside the rim, the one
 * edge that says the whole drum is sunk into the screen rather than lying on
 * it.
 */
export function drawMazeFloors(
  ctx: CanvasRenderingContext2D,
  drum: { cx: number; cy: number; r: number },
  wheel: MazeWheel,
): void {
  const { cx, cy, r } = drum;
  ctx.save();
  for (let k = wheel.rings; k >= 1; k--) {
    const outer = (r * mazeCircleMilli(wheel, k)) / 1000;
    const depth = 1 - (k - 1) / Math.max(1, wheel.rings - 1);
    ctx.fillStyle = rgba(PALETTE.background, OUTER + (INNER - OUTER) * depth);
    ctx.beginPath();
    ctx.arc(cx, cy, outer, 0, Math.PI * 2);
    ctx.fill();
  }

  const lip = ctx.createRadialGradient(cx, cy, r * (1 - LIP * 2), cx, cy, r);
  lip.addColorStop(0, rgba(PALETTE.background, 0));
  lip.addColorStop(1, rgba(PALETTE.background, 0.5));
  ctx.fillStyle = lip;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * The posts, over the lines.
 *
 * Two faces either side of the stroke the sheet draws, the lit one decided by
 * the wall's own bearing against the key so the whole drum agrees about where
 * the light is; and a brighter cap where the wall meets the ring it is cut
 * through, because the end of a wall is the corner a pair has to get round and
 * is the one mark they actually navigate by.
 *
 * Nothing here decides where a wall is: `wheel.walls` is read, the same array
 * the route was solved from.
 */
export function drawMazePosts(
  ctx: CanvasRenderingContext2D,
  drum: { cx: number; cy: number; r: number },
  wheel: MazeWheel,
  angleMilli: number,
): void {
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

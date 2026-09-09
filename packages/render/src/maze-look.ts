import type { MazeWheel, SimConfig } from "@neon-spore/sim";
import type { MazeBreakup } from "./maze-fall.js";
import { drawMazeFloors, drawMazePosts } from "./maze-relief.js";
import { drawMazeWalls } from "./maze-walls.js";

/**
 * THE ONE RECORD A CANDIDATE **MAZE** PATCHES, and the first on the page whose
 * subject is a round rather than the field.
 *
 * Every slot VERSUS has ever opened is a creature, the ship, a control or a
 * boss's armour — all of them the field. The interludes are whole screens with
 * their own walls, tables, ribbons and pieces, they are what a pair looks at
 * for a minute at a time with nothing falling, and not one of them had ever
 * been offered a second answer to anything it draws. That was not because they
 * are finished; it was because `tools/director/src/versus-pose.ts` maps a slot
 * to a *field* pose and nobody had built one that hands the pair a round.
 * `poses-rounds.ts` is that pose, and this is the first slot to use it.
 *
 * **One field, and it is the drum standing still.** `maze-walls.ts` is the
 * circles, the gaps cut in them and the radial walls that make the corridors
 * turn — everything that is *there* before a shot, a mouth, a string or a
 * heart is drawn on top of it. The rest of `maze-draw.ts` is deliberately not
 * in here: what a look for this round is about is whether a pair can read the
 * maze at speed, and the shot is what they read *against* it.
 *
 * **What a candidate may not do is move a wall.** Every line the shipped
 * function draws comes out of `wheel`, which is the same `walls` and
 * `openings` the route was solved from — so a corridor drawn open is a
 * corridor the shot may use. A look that redrew the geometry could put a way
 * in where there is none, which is not a look, it is a lie about the round.
 * Call the wheel; argue about the paint.
 */
export interface MazeLook {
  /** The drum as the sheet has it: every circle, every gap, every radial wall. */
  readonly walls: (
    ctx: CanvasRenderingContext2D,
    drum: { cx: number; cy: number; r: number },
    wheel: MazeWheel,
    angleMilli: number,
    breakup: MazeBreakup,
    cfg: SimConfig,
  ) => void;
}

export const MAZE_LOOK: MazeLook = {
  // The shipped function takes no `cfg` and does not need one; the record
  // carries it because a candidate that shades a corridor has to know how wide
  // the rings are in the simulation's own units, and a look reaching for a
  // config the call site already holds is better than one guessing at it.
  //
  // **Three calls in one order, and the order is the whole picture.** The
  // floors go down first, the sheet's own lines over them, the posts on top of
  // those — a room, rather than a stack of discs or a set of marks floating on
  // the field. `maze-relief.ts` has the argument and both halves of it; what
  // matters here is that `drawMazeWalls` still draws every circle, every gap
  // and every radial wall, in the middle, untouched.
  walls: (ctx, drum, wheel, angleMilli, breakup) => {
    drawMazeFloors(ctx, drum, wheel);
    drawMazeWalls(ctx, drum, wheel, angleMilli, breakup);
    drawMazePosts(ctx, drum, wheel, angleMilli);
  },
};

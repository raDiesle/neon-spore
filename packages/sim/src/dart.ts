import { nextInt, type Rng } from "./rng.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE DART: the first body that does not hold its lane.
 *
 * Everything else on the field falls straight down, so a column said out loud
 * is a column that stays true until the thing lands. A dart makes that
 * sentence expire. It never falls vertically at all — every move is a diagonal
 * of `DART_ROWS` down and `DART_COLS` across, to one side or the other, and
 * which side is drawn from the seeded rng at the *end* of the move before it.
 * Between two moves it hangs for a beat, and that beat is the whole creature:
 * it is when the pair has to say something, and it is exactly one beat long.
 *
 * Only player 2 is shown which way (`radar: "p1"` is the clasp's rule crossed
 * the other way — see `CREATURES`), so the column player 1 has to be standing
 * in is a column only the other seat can name.
 *
 * **The two beats are one cycle and the average is a slick's pace.** Two rows
 * every two beats is one row a beat, so a dart crosses the field in the time
 * a slick does and the `4 seconds to impact` rule in `.claude/skills/new-creature`
 * is satisfied by the same arithmetic that satisfies it for every other body.
 */

/** Which way a dart goes: left or right. Never straight down. */
export type DartDir = -1 | 1;

/**
 * Rows a dart covers on the beat it moves, and columns it covers with them.
 * Equal on purpose: the tiles are square, so a move that spends the same
 * number of each is a true 45° diagonal, and "down and to the left" is a
 * thing an eye reads off the picture rather than a thing it has to measure.
 */
export const DART_ROWS = 2;
export const DART_COLS = 2;

/**
 * The direction this dart is concerned with right now — the way it is
 * travelling while it moves, and the way it will go next while it hangs.
 * `dartFloat` is which of the two.
 *
 * A rule rather than `c.dartDir ?? 1` at each site: render/ draws the lean,
 * the jet and player 2's arrow off this, and a body leaning one way while the
 * arrow over it points the other is the one defect this creature cannot
 * survive.
 */
export function dartHeading(c: Creature): DartDir {
  return c.dartDir === -1 ? -1 : 1;
}

/** Whether a dart in this column could take a whole move to that side. */
export function dartFits(col: number, cols: number, dir: DartDir): boolean {
  const to = col + DART_COLS * dir;
  return to >= 0 && to <= cols - 1;
}

/**
 * Where a move to `dir` lands it. Clamped, which only ever bites on a field
 * narrower than `2 * DART_COLS + 1` columns — no field the game ships is, and
 * a dart pinned against an edge is still better than a dart off it.
 */
export function dartStepCol(col: number, cols: number, dir: DartDir): number {
  return Math.max(0, Math.min(cols - 1, col + DART_COLS * dir));
}

/**
 * Which way the next move goes. Random between the two sides, except at the
 * edges, where the side that would leave the field is simply not offered —
 * the zig-zag turns back inward instead of flattening against the wall, so
 * the picture the pair is reading never stops being a zig-zag.
 *
 * The rng is drawn from exactly once per move, edge or no edge, so two devices
 * consume the same stream whatever the column. Never fold the edge test into
 * the draw.
 */
export function dartPickDir(rng: Rng, col: number, cols: number): DartDir {
  const roll: DartDir = nextInt(rng, 2) === 0 ? -1 : 1;
  if (dartFits(col, cols, roll)) return roll;
  const other: DartDir = roll === -1 ? 1 : -1;
  return dartFits(col, cols, other) ? other : roll;
}

/**
 * One beat of a dart, in place of the fall every other kind takes.
 *
 * Called from `onBeat` instead of `grippedFallTiles`, which is why a dart is
 * not grippable (`isGrippable`): a hand on it would drag at a number this
 * function never reads, and would show every sign of working.
 */
export function stepDart(world: World, c: Creature): void {
  if (c.dartFloat) {
    // It hung last beat, so this is the move it was aiming. `dartDir` is left
    // exactly as it was: while the body travels, it is the direction of
    // travel, which is what the jet is drawn along.
    c.col = dartStepCol(c.col, world.cfg.cols, dartHeading(c));
    c.row += DART_ROWS;
    c.dartFloat = false;
    return;
  }
  // It travelled last beat. Now it hangs, and takes aim: from here to the next
  // beat, `dartDir` is where it is *going*, which is what player 2's arrow
  // says and what nobody else on the field ever has to be told.
  c.dartFloat = true;
  c.dartDir = dartPickDir(world.rng, c.col, world.cfg.cols);
}

import { hullRow } from "./config.js";
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
 * which side is drawn from the seeded rng a whole beat before the move that
 * takes it (`dartNext`). Between two moves it hangs for a beat, and that beat
 * is when the pair acts on what it has already been told.
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

/**
 * The move *after* the one `dartHeading` names — rolled a beat early, and the
 * whole of why a dart can be read while it is still travelling.
 *
 * It used to be that nothing knew this until the body had landed, so the arrow
 * could only appear on the beat it hung: half of every cycle said nothing, and
 * the pair had one beat to say a column and act on it. With the roll moved one
 * beat forward the picture is continuous — while it runs, the arrow already
 * names the side of the *next* diagonal, and `dartPath` in render/ can draw
 * both segments at once.
 *
 * The invariant that makes it honest: `dartNext` is always rolled from the
 * column the move it describes will *start* in, so the edge test in
 * `dartPickDir` is asked about the right column and a previewed path never
 * bends somewhere the body will not.
 */
export function dartNextHeading(c: Creature): DartDir {
  return c.dartNext === -1 ? -1 : 1;
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
    // Clamped onto the ship's row for the same reason every fall is
    // (`onBeat`): a dart takes two rows at a time, so without this the one
    // move that reaches the hull would carry it a row *under* the ship, and
    // the beat render/ spends drawing it arrive would draw it arriving in the
    // band. The row it lands on is the row it breaks the hull from.
    c.row = Math.min(c.row + DART_ROWS, hullRow(world.cfg));
    c.dartFloat = false;
    return;
  }
  // It travelled last beat. Now it hangs, and takes aim. Nothing is rolled for
  // *this* move — it was rolled a beat ago, from this very column, and player
  // 2 has been looking at it since the run began. What is rolled here is the
  // one after it, from the column this move will land in.
  c.dartFloat = true;
  c.dartDir = dartNextHeading(c);
  c.dartNext = dartPickDir(
    world.rng,
    dartStepCol(c.col, world.cfg.cols, c.dartDir),
    world.cfg.cols,
  );
}

/**
 * The two sides a dart is born with: the one it will take out of the beat it
 * hangs on arrival, and the one after that.
 *
 * Two draws, in this order, on the beat it enters. One function rather than an
 * object literal at the spawn site because the second roll has to be asked
 * about the column the *first* move lands in, and that arithmetic written out
 * by hand beside a spawn is exactly the second copy of `dartStepCol` this
 * creature cannot afford.
 */
export function dartOnSpawn(
  world: World,
  col: number,
): { dartFloat: true; dartDir: DartDir; dartNext: DartDir } {
  const dir = dartPickDir(world.rng, col, world.cfg.cols);
  const next = dartPickDir(world.rng, dartStepCol(col, world.cfg.cols, dir), world.cfg.cols);
  return { dartFloat: true, dartDir: dir, dartNext: next };
}

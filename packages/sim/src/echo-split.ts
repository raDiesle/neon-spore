import { hullRow, type SimConfig } from "./config.js";
import { echoSplitsLeft } from "./echo.js";
import { clampSpanCol } from "./span.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * How an echo comes apart: which way the halves step, how long each generation
 * waits first, and the one pass a beat that does it.
 *
 * Split out of `echo.ts` when this creature grew a clock of its own and that
 * file went over its 250-line limit. The seam is the same one `shell.ts` and
 * `shell-round.ts` already use: next door is what the body *is* — how fast it
 * falls, which slick or bulb it is drawn as, what a shot at it is worth — and
 * this is the event that turns one of them into two. They change for different
 * reasons, and only this half has anything to say about timing.
 */

/**
 * The direction the two halves of a division step, one each way, indexed by
 * which division this is — the first is `ECHO_AXES[0]`.
 *
 * **Sideways, then up and down, then both at once.** The turn is what keeps
 * the bodies adjacent instead of strung across the field: one tile each way on
 * a new axis puts four in a two-by-two block, and a block is a thing the pair
 * can point at as one before they have to take it apart.
 *
 * **The third reaches two squares rather than one, and that is arithmetic
 * rather than taste.** A diagonal step of one from a two-by-two block lands
 * two of the eight bodies on the same square — a body hidden behind a body is
 * a shot that kills the wrong one and a count that is wrong out loud. Two is
 * the smallest step that keeps all eight apart.
 *
 * The list is the whole rule, so `echoSplits` above its length is a
 * configuration this file cannot honour: the axis is clamped to the last one
 * and bodies would begin to overlap. `echo.test.ts` holds the ceiling.
 */
export const ECHO_AXES: readonly { col: number; row: number }[] = [
  { col: 1, row: 0 },
  { col: 0, row: 1 },
  { col: 2, row: 2 },
];

/**
 * Which division this body is waiting for, counted from zero. Derived from
 * the count left rather than stored beside it, for `ghostIsCharging`'s reason:
 * two fields saying one thing are two fields that can disagree, and here they
 * would disagree about which way the body is about to come apart.
 */
export function echoGeneration(cfg: SimConfig, c: Creature): number {
  return cfg.echoSplits - echoSplitsLeft(c);
}

/**
 * The direction each half steps on this body's next division, or nothing at
 * all for one that has finished dividing.
 */
export function echoAxis(cfg: SimConfig, c: Creature): { col: number; row: number } | null {
  if (echoSplitsLeft(c) <= 0) return null;
  const at = Math.min(echoGeneration(cfg, c), ECHO_AXES.length - 1);
  return ECHO_AXES[at] ?? null;
}

/**
 * Beats this body waits before it divides. One `echoSplitBeats` for the first
 * division, two for the second, three for the third — so the gap between one
 * and the next grows by the same amount every time, and the pair is never
 * given a rhythm they can answer without looking.
 */
export function echoWaitBeats(cfg: SimConfig, c: Creature): number {
  return cfg.echoSplitBeats * (echoGeneration(cfg, c) + 1);
}

/**
 * How far through that wait this body is, 0..1, or 0 for one with no division
 * left. render/ reads it for the strain and the seam, so the picture that says
 * *this is about to come apart* and the beat it actually comes apart on are
 * one number rather than two.
 *
 * It takes beats as a fraction rather than an integer: the drawing is sampled
 * between beats, and a furrow that opened in steps would read as a stutter
 * rather than as strain.
 */
export function echoSplitPhase(cfg: SimConfig, beats: number, c: Creature): number {
  if (echoSplitsLeft(c) <= 0) return 0;
  const wait = echoWaitBeats(cfg, c);
  if (wait <= 0) return 1;
  const gone = beats - (c.echoBeat ?? 0);
  return Math.max(0, Math.min(1, gone / wait));
}

/**
 * Whether this body's wait is up on this beat.
 *
 * A moment plus a length, never a number that ticks down — `World.guardTick`'s
 * rule, and it matters here for the reason it matters there: a countdown is a
 * second copy of `echoSplitBeats` that can disagree with the config it came
 * from, and render would then draw a body straining towards a division the
 * simulation had already taken.
 */
export function echoDue(cfg: SimConfig, beat: number, c: Creature): boolean {
  return echoSplitsLeft(c) > 0 && beat - (c.echoBeat ?? 0) >= echoWaitBeats(cfg, c);
}

/**
 * One beat of dividing, for the whole field at once.
 *
 * Every body whose wait is up comes apart, and the halves it leaves behind
 * start their own — longer — wait from this beat. A body pushed by this pass
 * is not walked by it, so nothing divides twice on one beat however the waits
 * fall.
 *
 * The halves inherit everything the parent had except their place, their count
 * and their clock — `fromCol` and `fromRow` included, and that inheritance is
 * the picture. They are where the parent was standing at the top of this beat,
 * so render draws one body gliding down and opening into two rather than two
 * bodies appearing a tile apart. That glide is the only announcement the
 * division gets after the fact, and it is enough: the announcement that matters
 * came *before*, in the seam and the strain render reads off
 * `echoSplitPhase`.
 */
export function splitEchoes(world: World): void {
  const dividing = world.creatures.filter(
    (c) => c.kind === "echo" && echoDue(world.cfg, world.beat, c),
  );
  if (dividing.length === 0) return;
  const gone = new Set(dividing.map((c) => c.id));
  world.creatures = world.creatures.filter((c) => !gone.has(c.id));
  // Nothing above the top row and nothing on the hull row: a division must not
  // put a body through the ship. The parent was above it, so its halves are.
  const lowest = hullRow(world.cfg) - 1;
  for (const parent of dividing) {
    const axis = echoAxis(world.cfg, parent) ?? { col: 0, row: 0 };
    const left = echoSplitsLeft(parent) - 1;
    for (const side of [-1, 1] as const) {
      world.creatures.push({
        ...parent,
        id: world.nextId++,
        // An echo is one tile wide, so the clamp is over a span of one — but
        // it is `clampSpanCol` rather than a pair of comparisons written here,
        // because "keep a body's whole width on the field" is a rule this file
        // calls and does not re-derive (`kinds.ts`).
        col: clampSpanCol(parent.col + side * axis.col, world.cfg.cols, 1),
        row: Math.max(0, Math.min(lowest, parent.row + side * axis.row)),
        echoSplits: left,
        echoBeat: world.beat,
      });
    }
  }
}

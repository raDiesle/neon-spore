import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE BEATBOX's readings that decide nothing**: how long ago a thumb
 * counted, how long ago one missed, how long ago the box came apart, and how
 * long the run was that a discharge took away.
 *
 * Cut out of `beatbox.ts` when the counter's four states took that file over
 * its 250-line limit, along a seam the state itself already draws
 * (`creature-state-beatbox.ts`). Next door is what a box *is* — a count, a
 * run, which beat a tap belongs to, when a run is over — and every one of
 * those is asked by a rule. None of these four is: they are three ticks and a
 * number, read by `packages/render` to know how far through a glow, a ring, a
 * red dot or a red row the picture has got, and a rule that consulted one
 * would be a rule that changed when somebody retimed an animation.
 *
 * They are in the fingerprint like every other field a body carries: a value
 * no rule reads is still a value two devices can disagree about (CLAUDE.md
 * rule 4, `hash-creature-late.ts`).
 *
 * `beatbox.ts` re-exports all four, so nothing that already reached for one
 * through that file had to move.
 */

/** How long ago a thumb missed the beat on this box, in ticks, or null for one
 * nobody has missed. What the counter's red next-dot is timed from. */
export function beatboxMissAge(world: World, c: Creature): number | null {
  return c.beatboxMiss === undefined ? null : world.tick - c.beatboxMiss;
}

/** The count a discharge took away with it, for the marks to keep showing
 * while the red lasts (`creature-state-beatbox.ts`). Nought for a box that has
 * never come apart, which draws no dots at all. */
export function beatboxSpentRun(c: Creature): number {
  return c.beatboxRan ?? 0;
}

/**
 * **How long ago the last counting thumb landed**, in ticks, or null for a box
 * nobody has touched.
 *
 * Here rather than at the draw site because three pictures are timed from it —
 * the glow under the thumb, the green ring going out of the body, and the arm
 * growing out of the rim — and three copies of `world.tick - c.beatboxTick`
 * is three places that can disagree about when a press happened. The purity
 * test carries a row for exactly this shape (`packages/sim/test/purity.test.ts`).
 */
export function beatboxTapAge(world: World, c: Creature): number | null {
  return c.beatboxTick === undefined ? null : world.tick - c.beatboxTick;
}

/** The same reading for the last discharge: how long the body has been lit
 * red, in ticks, or null for a box that has never come apart. */
export function beatboxWrongAge(world: World, c: Creature): number | null {
  return c.beatboxWrong === undefined ? null : world.tick - c.beatboxWrong;
}

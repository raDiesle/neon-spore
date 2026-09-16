import { MILLI, type World } from "./world.js";

/**
 * **THE SLOW**: a span of beats played at a fraction of wall-clock rate, on
 * both devices at once.
 *
 * The owner asked for cinematic slow motion on 16 September 2026 and was
 * refused; he overruled it and supplied the condition that makes the refusal
 * wrong — *both animations in slow mode start and end at the same time for
 * both players*. `docs/decisions.md` #33 is the whole argument and this file
 * is all of the mechanism that lives in the simulation.
 *
 * **What is slowed is `tickMs` and never `ticksPerBeat`.** Milliseconds per
 * tick is wall clock and belongs to `apps/game/src/loop.ts`, which is the one
 * file in the stack that has a clock at all — its own header is the permission
 * slip: *"Wall-clock time exists here and nowhere below: the simulation only
 * ever hears 'one tick has passed'."* Ticks per beat is simulation, and a slow
 * that touched it would change how far a body falls in a beat, which is the
 * game rather than the picture (`apps/game/src/testing.ts` calls the
 * alternative an *uneven beat* and throws).
 *
 * So nothing here slows anything. What these three functions do is say **which
 * beats are inside a window**, out of two integers that are fields of `World`
 * and therefore in `hashWorld` — and that is the whole of what satisfies the
 * owner's condition. Two devices agree about the boundaries because they agree
 * about everything (`docs/decisions.md` #23); the simulation runs the same
 * integer steps on the same tick numbers either way, so `hashWorld` cannot
 * tell a slow window from an ordinary one. Only the wall-clock rate at which
 * those ticks are consumed is local, and two phones 200 ms apart before a
 * window are 200 ms apart after it.
 *
 * **It is not THE DRAG**, which is the other, shipped thing and is not a
 * substitute for it: a drag is a body taking more *beats* to fall — THE GRIP's
 * `grippedFallTiles`, `slow-fall.ts`'s `slowStep` — and it changes the
 * mechanic. A slow changes how long a beat takes in the hand and changes no
 * rule at all. A boss may want either.
 */

/** No window open. Both boundaries carry it; neither is ever half set. */
export const NO_SLOW = -1;

/**
 * Whether the beat is being played slowly this instant.
 *
 * Half-open, `[from, to)`, for the reason every window in this game is: the
 * beat a window closes on is the first ordinary beat again, so a caller that
 * opens one for two beats gets exactly two, and two windows opened back to
 * back do not overlap on the beat between them.
 */
export function slowing(world: World): boolean {
  return (
    world.slowToBeat !== NO_SLOW &&
    world.beat >= world.slowFromBeat &&
    world.beat < world.slowToBeat
  );
}

/**
 * How fast the beat is being played, in thousandths of its ordinary rate —
 * `MILLI` when nothing is slowed.
 *
 * The loop divides by this rather than multiplying by a fraction, so the
 * ordinary case is an exact `1000 / 1000` and no frame of the shipped game
 * acquires a rounding step it did not have.
 */
export function slowRateMilli(world: World): number {
  return slowing(world) ? world.cfg.slowRateMilli : MILLI;
}

/**
 * Open a window here, for this many beats.
 *
 * **From `world.beat` and not from a beat a caller names**, which is the one
 * rule that keeps this safe: a window that could be scheduled would be a
 * window one device could schedule and the other could miss, and the
 * boundaries would stop being a fact both of them already agree about. A boss
 * opens one on the beat the drama is on, inside `stepBoss`, which both devices
 * run on the same tick.
 *
 * Re-opening while one is already up simply moves the end, which is right: two
 * dramatic beats in a row are one long window, not a window that stops and
 * starts again in the middle of the pair's sentence about it.
 */
export function openSlow(world: World, beats: number): void {
  if (beats <= 0) return;
  world.slowFromBeat = slowing(world) ? world.slowFromBeat : world.beat;
  world.slowToBeat = world.beat + beats;
}

/**
 * Nothing slowed. Called by `startWave` for the reason every other wave-local
 * field is cleared there: a window inherited across a wave would open the next
 * one at a third rate with nothing dramatic happening in it.
 */
export function clearSlow(world: World): void {
  world.slowFromBeat = NO_SLOW;
  world.slowToBeat = NO_SLOW;
}

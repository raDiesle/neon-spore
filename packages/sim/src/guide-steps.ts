import type { Briefings } from "./briefing.js";
import { seatReady } from "./ready-gate.js";
import type { World } from "./world.js";

/**
 * A guide the pair turns the pages of, one seat at a time.
 *
 * A rehearsal used to be one film: five steps at a fixed tempo, looping, and
 * the ready gate under all of it. The owner's answer to watching it was that
 * nobody reads at the same speed as a clock — *every player has their own time
 * to go through the tutorial, and just at the end both need to say they are
 * ready.* So a guide with a rehearsal is a **stack of pages**, each one a step
 * of the film, and each seat has its own cursor into it. A page repeats its own
 * animation and its own words until the seat that is reading presses NEXT.
 *
 * ## The last page is the ready page
 *
 * `brief.steps` is how many *film* pages a guide has, so it has `steps + 1`
 * pages in total and the extra one is the gate: the wave's number, its name and
 * its sentence, with the two circles under them. That is the owner's own
 * arrangement — *when showing ready buttons, only the game screen with wave
 * name and description is shown* — and it is why a stepped guide passes
 * straight to the field rather than to the introduction. The introduction has
 * already been read, on the page the ready button was on.
 *
 * ## What a cursor may do
 *
 * Forward and back, clamped at both ends, and **never once this seat is
 * READY**. READY latches (`ready-gate.ts` says why), and a seat that could
 * page back out of it would be a seat un-readying itself while its partner was
 * already waiting on it. Stepping away from the ready page before the circle
 * fills empties it, because the fill is the evidence that this seat was looking
 * at the gate.
 *
 * ## Why the cursors are world state
 *
 * They are in `hashWorld` like everything else here. Two devices that disagree
 * about how far a seat has read disagree about whether that seat is allowed to
 * hold the gate, and that is a disagreement about when the wave starts. It
 * costs two integers and it cannot drift.
 */

/** How many pages a guide has in all: its film's steps, then the ready page. */
export function guidePages(world: World): number {
  return world.brief.steps + 1;
}

/** Whether this wave's guide is one the pair pages through at all. */
export function guideStepped(world: World): boolean {
  return world.brief.steps > 0;
}

/** The page this seat is on, 0..`guidePages` - 1. */
export function guidePage(world: World, player: 1 | 2): number {
  return player === 1 ? world.brief.stepP1 : world.brief.stepP2;
}

/**
 * Whether this seat has reached the gate. An unstepped guide is *always* at
 * its gate: there are no pages to turn and the hold is the whole of it.
 */
export function onReadyPage(world: World, player: 1 | 2): boolean {
  if (!guideStepped(world)) return true;
  return guidePage(world, player) >= world.brief.steps;
}

/**
 * One seat turning a page. A seat that has already said READY does not move —
 * its half of the gate is crossed and its partner is waiting on the other.
 */
export function guideStepHeard(world: World, player: 1 | 2, back: boolean): void {
  if (!guideStepped(world) || seatReady(world, player)) return;
  const last = guidePages(world) - 1;
  const next = Math.max(0, Math.min(last, guidePage(world, player) + (back ? -1 : 1)));
  setPage(world, player, next);
}

/** This seat straight to the gate — what a caller with no thumbs asks for. */
export function toReadyPage(world: World, player: 1 | 2): void {
  if (!guideStepped(world)) return;
  setPage(world, player, world.brief.steps);
}

function setPage(world: World, player: 1 | 2, page: number): void {
  const b = world.brief;
  if (player === 1) b.stepP1 = page;
  else b.stepP2 = page;
  // Off the gate is out of the gate: a circle part-filled by a thumb that then
  // paged back is a circle nobody was looking at.
  if (page >= b.steps) return;
  if (player === 1) {
    b.fillP1 = 0;
    b.holdP1 = false;
  } else {
    b.fillP2 = 0;
    b.holdP2 = false;
  }
}

/** Both cursors back to the first page. `steps` is the wave's and is not one. */
export function clearPages(b: Briefings): void {
  b.stepP1 = 0;
  b.stepP2 = 0;
}

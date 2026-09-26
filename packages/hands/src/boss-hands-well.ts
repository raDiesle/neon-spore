import { type TimedCommand, type World, wellBoss, wellHeldNow } from "@neon-spore/sim";
import type { Hand } from "./hand.js";

/**
 * **The pilot's thumb on THE WELL's seam**, on a page of its own because this
 * boss's hand is unlike every other hand in the director: there is nothing on
 * the field to press, nothing to aim at and nothing to fire. The whole fight
 * is one thumb on the one sector of the clock face that holds no column, read
 * two ways by what the face is doing — held while it slips, turned while it
 * stands at the far end (`sim/well-hand.ts`).
 *
 * `boss-hands-clocks.ts` next door is the page for bosses that keep a ledger
 * the pair keeps too, and it was three lines under its limit; this is neither
 * that kind of boss nor a page that wants to be shared.
 */

type Press = Omit<TimedCommand, "tick">;

/** The pilot's thumb, carried `fromMilli` thousandths of a sector round the face. */
const seam = (on: boolean, fromMilli: number): Press => ({
  player: 1,
  command: { kind: "drag", target: "wellSeam", on, fromMilli },
});

/**
 * The thumb put down on the seam and left there while the face slips, which is
 * the hold: `wellHoldBeats` beats bought and then spent, and the face slipping
 * on under a thumb that has run out (`sim/well-step.ts`).
 *
 * Pressed once and not again, for `leadHoldHand`'s reason next door: the grab
 * records where the seam stood when it was taken hold of, and a hand that
 * grabbed afresh every tick would re-anchor it under itself every tick.
 */
export const wellHoldHand: Hand = (w: World) => {
  const b = wellBoss(w);
  if (b === null || b.phase !== "rolling" || wellHeldNow(b)) return [];
  return [seam(true, 0)];
};

/**
 * The thumb that turns the face home once it has stopped at the far end: the
 * same handle, the other meaning, and the one that starts the cycle over.
 *
 * It waits for `wound` — a carry during `rolling` is not a turn and is ignored
 * by the simulation — then grabs and carries the whole offset back in one
 * press, which is what a thumb sweeping the seam up to twelve reports.
 */
export const wellWindHand: Hand = (w: World) => {
  const b = wellBoss(w);
  if (b === null || b.phase !== "wound") return [];
  if (!wellHeldNow(b)) return [seam(true, 0)];
  return [seam(true, -b.gripMilli)];
};

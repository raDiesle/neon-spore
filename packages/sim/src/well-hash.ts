import { WELL_PHASES, type WellState } from "./well.js";

/**
 * What THE WELL puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `lead-hash.ts` is one: `hash-boss.ts` grows by
 * a whole boss at a time.
 *
 * **Every field, and the angle is the one that matters.** This boss changes
 * nothing about how the field runs, so the temptation is to call its state
 * cosmetic and leave it out — and that is exactly backwards. The offset is
 * what the pilot's picture is made of, and a device that disagrees about it
 * draws the seam somewhere the other phone does not, answers his thumb for a
 * different sector, and hands the pair two different clocks to talk about.
 * The grip goes in with it: a thumb held across the turn into `wound` carries
 * from where it was re-anchored, so two devices that disagree about the
 * anchor turn the face by different amounts for the same hand.
 */
export function wellHashParts(s: WellState): number[] {
  return [WELL_PHASES.indexOf(s.phase), s.phaseBeat, s.offsetMilli, s.heldBeats, s.gripMilli];
}

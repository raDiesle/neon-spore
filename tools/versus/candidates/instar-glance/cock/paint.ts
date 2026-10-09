import { bodyLife } from "../../../../../packages/render/src/motion-life.js";

/**
 * The head turns left and right on one slow clock and cocks side to side
 * three times as fast, so the face keeps changing its angle. Only the snout swings and the eyes are
 * held (`instar-turn.ts`); the cock moves them by a few pixels at most.
 */

/**
 * The turn: how far either way from the middle of its range, where that is,
 * and its period — six seconds, the length the pair replays its pose over.
 */
const REACH = 0.17;
const MIDDLE = 0.05;
const PERIOD = 6;
/** The cock: how far, radians, and its period, three to the turn's one. */
const COCK = 0.09;
const COCK_PERIOD = 2;

export function cockGlance(time: number): number {
  return (MIDDLE + REACH * Math.sin((2 * Math.PI * time) / PERIOD)) * bodyLife();
}

export function cockRoll(time: number): number {
  return COCK * Math.sin((2 * Math.PI * time) / COCK_PERIOD + 1) * bodyLife();
}

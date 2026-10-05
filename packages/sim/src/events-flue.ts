import type { FlueMissWhy } from "./flue.js";

/**
 * What THE FLUE says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to: the shot's column for a hit and a miss, the middle for the rest.
 * **Nothing says where the ember is**: the navigator is not shown it, and a
 * sound panned to it would show it to the navigator's ear.
 */

interface FlueColEvent {
  /** The column it happened over. */
  col: number;
}

export type FlueEvent =
  /** The flue slides into frame, the ember at its left end. */
  | ({ type: "flueEnter" } & FlueColEvent)
  /** Level `level` lit, counted from nought: the ember sets off with a full level of shots. */
  | ({ type: "flueLight"; level: number } & FlueColEvent)
  /** The ember met in the level's weapon and colour; `hits` is the levels cleared. */
  | ({ type: "flueHit"; hits: number } & FlueColEvent)
  /** A shot spent, and why; `shots` is what the level has left, nought being the wave. */
  | ({ type: "flueMiss"; shots: number; why: FlueMissWhy } & FlueColEvent)
  /** The last level cleared: the flue goes cold. */
  | ({ type: "flueSpent" } & FlueColEvent)
  /** The spent flue has stood `flueSpentBeats`; the wave may end. */
  | ({ type: "flueOut" } & FlueColEvent);

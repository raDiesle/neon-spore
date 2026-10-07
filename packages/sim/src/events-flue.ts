import type { FlueMissWhy } from "./flue.js";

/**
 * What THE FLUE says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to: the shot's column for a hit and a miss, the middle for the rest.
 * **No column says where the ember is**: the navigator is not shown it, and
 * a sound panned to it would show it to the navigator's ear. A hit and a
 * miss carry `emberMilli`, where the shot met it, for the screen that is
 * shown the ember to beam it out from there (`render/flue-beam.ts`).
 */

interface FlueColEvent {
  /** The column it happened over. */
  col: number;
}

interface FlueMetEvent extends FlueColEvent {
  /** Where the ember was as the shot met its row, thousandths of a column off the middle. */
  emberMilli: number;
}

export type FlueEvent =
  /** The flue slides into frame, the ember at its left end. */
  | ({ type: "flueEnter" } & FlueColEvent)
  /** Level `level` lit, counted from nought: the ember sets off with a full level of shots. */
  | ({ type: "flueLight"; level: number } & FlueColEvent)
  /**
   * The ember met in the level's weapon and colour; `hits` is the levels
   * cleared, and `left` the meetings the lit level still needs — nought when
   * this one cleared it, more on a level that asks for it again.
   */
  | ({ type: "flueHit"; hits: number; left: number } & FlueMetEvent)
  /**
   * A shot spent, and why; `shots` is what the level has left, nought being
   * the wave. `late` is whether the ember had already run past the cannon.
   */
  | ({ type: "flueMiss"; shots: number; why: FlueMissWhy; late: boolean } & FlueMetEvent)
  /** The last level cleared: the flue goes cold. */
  | ({ type: "flueSpent" } & FlueColEvent)
  /** The spent flue has stood `flueSpentBeats`; the wave may end. */
  | ({ type: "flueOut" } & FlueColEvent);

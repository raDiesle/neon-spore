import type { GovernorAsk } from "./governor.js";

/**
 * What THE GOVERNOR says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to: the governor stands mid-hull, so it is the middle column for all of
 * them. A seat is `side`, nought the pilot.
 */

interface GovernorColEvent {
  /** The column it happened over. */
  col: number;
}

export type GovernorEvent =
  /** The governor swings into frame, the needle idling at the top of the rim. */
  | ({ type: "governorEnter" } & GovernorColEvent)
  /** A step lit: `marks` on the rim to tap, or none and the hub to shoot. */
  | ({ type: "governorLight"; ask: GovernorAsk; marks: number } & GovernorColEvent)
  /** Mark `mark` of the lit step, at `markMilli` on the rim, landed by `side`; `taps` is that seat's count so far. */
  | ({
      type: "governorTick";
      side: 0 | 1;
      mark: number;
      markMilli: number;
      taps: number;
    } & GovernorColEvent)
  /** A tap came with the needle off the seat's mark, or out of turn: a missed pass, the step still lit. */
  | ({ type: "governorSkid"; side: 0 | 1 } & GovernorColEvent)
  /** The taps before the first shot all landed: the hub lights. */
  | ({ type: "governorHub" } & GovernorColEvent)
  /** A retap's last mark landed by `side`: the hub lit again. */
  | ({ type: "governorRetap"; side: 0 | 1 } & GovernorColEvent)
  /** A tap window ran out: the marks dim, to be lit again. */
  | ({ type: "governorSway" } & GovernorColEvent)
  /** A retap window ran out: the hub dims until the needle is tapped again. */
  | ({ type: "governorDim" } & GovernorColEvent)
  /** The hub shot in its colour; `hits` is how many it has taken. */
  | ({ type: "governorHit"; hits: number } & GovernorColEvent)
  /** A fire step ran out with the hub unshot: the hull takes it. */
  | ({ type: "governorMiss" } & GovernorColEvent)
  /** The script is done: the flyweights fly wide and the needle stalls. */
  | ({ type: "governorSpent" } & GovernorColEvent)
  /** The spent governor has stood `governorSpentBeats`; the wave may end. */
  | ({ type: "governorOut" } & GovernorColEvent);

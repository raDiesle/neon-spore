import type { TrapezeAsk } from "./trapeze.js";

/**
 * What THE TRAPEZE says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to: the lit column for a tap and a catch, the middle for the spindle
 * and the flag as a whole. A seat is `side`, nought the pilot.
 */

interface TrapezeColEvent {
  /** The column it happened over. */
  col: number;
}

export type TrapezeEvent =
  /** The boom swings into frame with the flag loose over the middle. */
  | ({ type: "trapezeEnter" } & TrapezeColEvent)
  /** A step lit: the flag to be caught over a column, or the spindle to shoot. */
  | ({ type: "trapezeLight"; ask: TrapezeAsk; offset: number } & TrapezeColEvent)
  /** A tap stilled the flag over the lit column. */
  | ({ type: "trapezeFreeze"; side: 0 | 1 } & TrapezeColEvent)
  /** A tap came while the flag was off the lit column: it swings on. */
  | ({ type: "trapezeFlap"; side: 0 | 1 } & TrapezeColEvent)
  /** The freeze ran out before a catch: the flag swings again. */
  | ({ type: "trapezeLapse" } & TrapezeColEvent)
  /** A loose that caught nothing — not drawn, not frozen, or the wrong way: a limp flutter. */
  | ({ type: "trapezeFlutter"; side: 0 | 1 } & TrapezeColEvent)
  /** A catch landed, loosed by `side`; `catches` so far. */
  | ({ type: "trapezeCatch"; side: 0 | 1; catches: number } & TrapezeColEvent)
  /** Both catches in: the spindle lights and the flag is held on it. */
  | ({ type: "trapezeSpindle" } & TrapezeColEvent)
  /** The creeping flag caught again, loosed by `side`: the spindle stays lit. */
  | ({ type: "trapezeRecatch"; side: 0 | 1 } & TrapezeColEvent)
  /** A catch window ran out: the flag swings on, to be caught again. */
  | ({ type: "trapezeSway" } & TrapezeColEvent)
  /** A recatch window ran out: the spindle dims until the flag is caught again. */
  | ({ type: "trapezeDim" } & TrapezeColEvent)
  /** The spindle shot in its colour; `hits` is how many it has taken. */
  | ({ type: "trapezeHit"; hits: number } & TrapezeColEvent)
  /** A fire step ran out with the spindle unshot: the hull takes it. */
  | ({ type: "trapezeMiss" } & TrapezeColEvent)
  /** The script is done: the spindle spent and the flag swinging free. */
  | ({ type: "trapezeSpent" } & TrapezeColEvent)
  /** The spent flag has swung `trapezeSpentBeats`; the wave may end. */
  | ({ type: "trapezeOut" } & TrapezeColEvent);

import type { BurgeeAsk } from "./burgee.js";

/**
 * What THE BURGEE says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to: the lit column for a tap and a catch, the middle for the spindle
 * and the flag as a whole. A seat is `side`, nought the pilot.
 */

interface BurgeeColEvent {
  /** The column it happened over. */
  col: number;
}

export type BurgeeEvent =
  /** The boom swings into frame with the flag loose over the middle. */
  | ({ type: "burgeeEnter" } & BurgeeColEvent)
  /** A step lit: the flag to be caught over a column, or the spindle to shoot. */
  | ({ type: "burgeeLight"; ask: BurgeeAsk; offset: number } & BurgeeColEvent)
  /** A tap stilled the flag over the lit column. */
  | ({ type: "burgeeFreeze"; side: 0 | 1 } & BurgeeColEvent)
  /** A tap came while the flag was off the lit column: it swings on. */
  | ({ type: "burgeeFlap"; side: 0 | 1 } & BurgeeColEvent)
  /** The freeze ran out before a catch: the flag swings again. */
  | ({ type: "burgeeLapse" } & BurgeeColEvent)
  /** A loose that caught nothing — not drawn, not frozen, or the wrong way: a limp flutter. */
  | ({ type: "burgeeFlutter"; side: 0 | 1 } & BurgeeColEvent)
  /** A catch landed, loosed by `side`; `catches` so far. */
  | ({ type: "burgeeCatch"; side: 0 | 1; catches: number } & BurgeeColEvent)
  /** Both catches in: the spindle lights and the flag is held on it. */
  | ({ type: "burgeeSpindle" } & BurgeeColEvent)
  /** The creeping flag caught again, loosed by `side`: the spindle stays lit. */
  | ({ type: "burgeeRecatch"; side: 0 | 1 } & BurgeeColEvent)
  /** A catch window ran out: the flag swings on, to be caught again. */
  | ({ type: "burgeeSway" } & BurgeeColEvent)
  /** A recatch window ran out: the spindle dims until the flag is caught again. */
  | ({ type: "burgeeDim" } & BurgeeColEvent)
  /** The spindle shot in its colour; `hits` is how many it has taken. */
  | ({ type: "burgeeHit"; hits: number } & BurgeeColEvent)
  /** A fire step ran out with the spindle unshot: the hull takes it. */
  | ({ type: "burgeeMiss" } & BurgeeColEvent)
  /** The script is done: the spindle spent and the flag swinging free. */
  | ({ type: "burgeeSpent" } & BurgeeColEvent)
  /** The spent flag has swung `burgeeSpentBeats`; the wave may end. */
  | ({ type: "burgeeOut" } & BurgeeColEvent);

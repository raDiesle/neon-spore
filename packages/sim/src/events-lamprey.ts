import type { Color } from "./types.js";

/**
 * What THE LAMPREY says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to: the jaw's column while it is on the hull, the middle column while it
 * rears. A seat is `side`, nought the pilot.
 */

interface LampreyColEvent {
  /** The column it happened over. */
  col: number;
}

export type LampreyEvent =
  /** The eel swims into frame over the hull. */
  | ({ type: "lampreyEnter" } & LampreyColEvent)
  /** The mouth bites onto the hull; `side` pins, and `tooth` is lit for the other. */
  | ({ type: "lampreyBite"; side: 0 | 1; tooth: number } & LampreyColEvent)
  /** The lit tooth knocked out by `side`. */
  | ({ type: "lampreyCrack"; side: 0 | 1; tooth: number } & LampreyColEvent)
  /** A tooth snapped back in: a wrong tap from `side`, or, without one, its window run out. */
  | ({ type: "lampreySnap"; tooth: number; side?: 0 | 1 } & LampreyColEvent)
  /** The jaw crawled a column along the hull, `dir` the way it went. */
  | ({ type: "lampreyCrawl"; dir: -1 | 1 } & LampreyColEvent)
  /** A beat with the jaw not pinned: the bite is `biteMilli` deep. */
  | ({ type: "lampreyGnaw"; biteMilli: number } & LampreyColEvent)
  /** A full bite: the hull takes it. */
  | ({ type: "lampreyFull" } & LampreyColEvent)
  /** The bite has given up its teeth: the mouth comes off the hull. */
  | ({ type: "lampreyLoose" } & LampreyColEvent)
  /** The eel rears over the hull with its gullet lit in `color`. */
  | ({ type: "lampreyRear"; color: Color | "either" } & LampreyColEvent)
  /** The gullet shot in its colour; `hits` is how many it has taken. */
  | ({ type: "lampreyHit"; hits: number } & LampreyColEvent)
  /** The gullet's window ran out: it lunges back onto the hull. */
  | ({ type: "lampreyLunge" } & LampreyColEvent)
  /** The script is done: the eel goes limp. */
  | ({ type: "lampreySpent" } & LampreyColEvent)
  /** The spent eel has fallen away `lampreySpentBeats`; the wave may end. */
  | ({ type: "lampreyOut" } & LampreyColEvent);

import type { LampreyFood } from "./lamprey-types.js";
import type { Color, CreatureKind } from "./types.js";

/**
 * What THE LAMPREY says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to: the tile's column while it is on one, the head's while it crawls. A seat is `side`, nought the
 * pilot.
 */

interface LampreyColEvent {
  /** The column it happened over. */
  col: number;
}

export type LampreyEvent =
  /** The eel crawls into frame from off the field's side. */
  | ({ type: "lampreyEnter" } & LampreyColEvent)
  /** Something dropped for it to eat, falling in `col`. */
  | ({ type: "lampreyFeed"; food: LampreyFood } & LampreyColEvent)
  /** It ate a body off the field at `col` and `row`, and leaves crumbs there. */
  | ({ type: "lampreyEat"; food: CreatureKind; row: number } & LampreyColEvent)
  /** It sets off crawling across the field toward its next stay. */
  | ({ type: "lampreyRoam" } & LampreyColEvent)
  /** It let go of dung, a rock for the shield, at `col` and `row`. */
  | ({ type: "lampreyDung"; row: number } & LampreyColEvent)
  /** It bites into the tile at `col`, `row`; `side` is on the tail, and `tooth` is lit. */
  | ({ type: "lampreyBite"; side: 0 | 1; tooth: number; row: number } & LampreyColEvent)
  /** The holder's thumb came down on the tail. */
  | ({ type: "lampreyGrip"; side: 0 | 1 } & LampreyColEvent)
  /** A tap from `side` on the lit tooth that has not cracked it yet: `taps` of the step's taken. */
  | ({ type: "lampreyTap"; side: 0 | 1; tooth: number; taps: number } & LampreyColEvent)
  /** The lit tooth knocked out by `side`. */
  | ({ type: "lampreyCrack"; side: 0 | 1; tooth: number } & LampreyColEvent)
  /** A tooth snapped back in: a tap from `side` on a dark tooth, or with the tail loose. */
  | ({ type: "lampreySnap"; tooth: number; side: 0 | 1 } & LampreyColEvent)
  /** The head pulled up by `side` with the tail loose: it slipped back into the bite. */
  | ({ type: "lampreySlip"; side: 0 | 1 } & LampreyColEvent)
  /** In a tow, the eel lost its temper two thirds of the way and lunged back at the hull, throwing off `side`'s thumb. */
  | ({ type: "lampreyAnger"; side: 0 | 1 } & LampreyColEvent)
  /** In a plug, `side` pressed the bitten button back toward its socket; `out` is how far out it is left, thousandths. */
  | ({ type: "lampreyPush"; side: 0 | 1; out: number } & LampreyColEvent)
  /** In a plug, `side` pulled the tail full with the button not in: the teeth yanked it out to `out`, and the thumb off. */
  | ({ type: "lampreyYank"; side: 0 | 1; out: number } & LampreyColEvent)
  /** The bite let go of its tile, leaving `tooth` in it, or -1 with none left behind. */
  | ({ type: "lampreyLoose"; tooth: number } & LampreyColEvent)
  /** The stay's window ran out: the bite went through, and the hull takes it. */
  | ({ type: "lampreyFull" } & LampreyColEvent)
  /** The eel rears on its tile with its gullet lit in `color`. */
  | ({ type: "lampreyRear"; color: Color | "either" } & LampreyColEvent)
  /** The gullet shot in its colour; `hits` is how many it has taken. */
  | ({ type: "lampreyHit"; hits: number } & LampreyColEvent)
  /** The script is done: the eel goes limp. */
  | ({ type: "lampreySpent" } & LampreyColEvent)
  /** The spent eel has fallen away `lampreySpentBeats`; the wave may end. */
  | ({ type: "lampreyOut" } & LampreyColEvent);

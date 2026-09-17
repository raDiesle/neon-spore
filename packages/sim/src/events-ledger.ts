import type { Color } from "./types.js";

/**
 * **Everything THE LEDGER does that neither screen already says**, as events.
 *
 * Its own file on `events-taster.ts`' terms, and one arm of `SimEvent`.
 *
 * Where the body stands, how wide the seam is, what colour it is showing, how
 * many returns are on the cord and how far down each is are all read off
 * `LedgerState` every frame (`ledger.ts`). What is **not** in the world a frame
 * later is the cord going in, a hit widening the seam, a return starting down
 * it, a return warded, a return thrown back up, a return that nobody answered,
 * the root sliding, and the tear — so each of those is one of these.
 *
 * **Every one of them names a column**, which is unusual in this game and is
 * the boss itself: a fight whose whole subject is *which column the plate has
 * to be in* has nothing to say that is not about one. The two that are about
 * the body rather than the hull say the seam's column, the six about the return
 * say the socket's, and the ear can pan the difference (`bind-ledger.ts`).
 */

/** The column the thing happened over. */
interface LedgerColEvent {
  col: number;
}

export type LedgerEvent =
  /** The cord pays out of its underside and roots in the hull, at `col`. */
  | ({ type: "ledgerRoot"; cols: number } & LedgerColEvent)
  /** A bolt of the seam's own colour: the split widens, and shows `color` next. */
  | ({ type: "ledgerSeam"; seam: number; color: Color } & LedgerColEvent)
  /** A bolt the plating or the wrong colour turned away. */
  | ({ type: "ledgerRefused" } & LedgerColEvent)
  /** A return is on the cord, `beats` from the socket at `col`. */
  | ({ type: "ledgerBead"; beats: number } & LedgerColEvent)
  /** The plate was in the socket and the trigger on the beat: the cord whips. */
  | ({ type: "ledgerWard" } & LedgerColEvent)
  /** A warded return thrown back **up** the cord: the seam widens with no bill. */
  | ({ type: "ledgerWhip"; seam: number } & LedgerColEvent)
  /** A return nobody answered, landing in the socket: the hull takes it. */
  | ({ type: "ledgerBill" } & LedgerColEvent)
  /** The root slid one column along the hull: the next one lands at `col`. */
  | ({ type: "ledgerSocket" } & LedgerColEvent)
  /** The last return is on the cord, and it is not the pair's to stop. */
  | ({ type: "ledgerLast"; beats: number } & LedgerColEvent)
  /** They warded it anyway: it is refused, and the fight holds open. */
  | ({ type: "ledgerHeld" } & LedgerColEvent)
  /** The cord tears out of the ship and the halves part: it is over. */
  | ({ type: "ledgerTear" } & LedgerColEvent);

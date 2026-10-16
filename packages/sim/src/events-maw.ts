import type { Color } from "./types.js";

/**
 * **The events of the maw's bodies** (`creature-kinds-maw.ts`), on
 * `events-carom.ts`' terms: one arrival taken apart, in a file of its own.
 */
export type MawEvent =
  /**
   * THE MORSEL was shot in its colour and went limp. Its own event rather
   * than a `destroy`, on `caromCrack`'s argument: a kill sound would tell the
   * pair the column is closed at the moment it has become the maw's problem,
   * and the one thing this body cannot survive is player 1 hearing "done".
   * Its finish is the pod's own `podTaken`, or `podLost`.
   */
  { type: "morselLimp"; col: number; row: number; color: Color };

import { DRAG_LOOKS } from "./field-looks-drag.js";
import { OTHER_LOOKS } from "./field-looks-other.js";

/**
 * What a card on CONTROLS › ON THE FIELD says under its picture — the two
 * things the owner asked to know of every use of a control (6 October 2026):
 * how the player knows where to do it, and what the picture does while the
 * finger or the key moves.
 *
 * Keyed by one row of the card; `test/field-page.test.ts` holds every card to
 * exactly one. The marks most bosses share are said once, in `MARKS`, so a
 * card says *haloed* rather than the whole sentence again.
 */
export interface UseLook {
  /** FIND IT: where it is, and what on the screen says it is asked. */
  find: string;
  /** WHILE YOU MOVE: what moves, fills or washes while the gesture is made. */
  move: string;
}

export const USE_LOOKS: Readonly<Record<string, UseLook>> = { ...DRAG_LOOKS, ...OTHER_LOOKS };

/** The marks nearly every boss's control wears, said once above the cards. */
export const MARKS =
  "Most controls a boss brings wear the same marks. A HALO under it on your " +
  "screen: it is asked of you, now. A TURNING RING AND A CLOCK on it on your " +
  "partner's screen: it is asked of them. GREEN when the gesture is taken, RED " +
  "when it is refused, falls short or runs out — on both screens.";

/** The look of a card: the first of its rows that has one. */
export function lookOf(rows: readonly string[]): UseLook | undefined {
  for (const r of rows) if (USE_LOOKS[r]) return USE_LOOKS[r];
  return undefined;
}

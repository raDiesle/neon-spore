import type { PlayerId } from "@neon-spore/net";

/**
 * **Who holds which seat, once the pair have a say in it.**
 *
 * A seat was the room's arrival order — the first phone was the pilot and
 * the second the navigator, whichever of the two people was holding which.
 * The owner asked on 14 September 2026 for the room screen to let the pair
 * choose, and for one of them to choose for both: the host, the phone that
 * opened the room (`seat.ts` `HOST_TAG`). The other sees the choice made and
 * takes the other seat, which is what "the other seat" means with two.
 *
 * The rule is pure and lives here so a test can hold it without a Durable
 * Object; the bit it decides, `swapped`, is the room's to keep
 * (`room-tally.ts`), and the tags it turns are read through it (`seat.ts`).
 */

/** The two things about a seat the rule reads (`seat.ts` `Seat` has both). */
export interface Asking {
  player: PlayerId;
  host: boolean;
}

/**
 * Whether a `seat` message turns the room's one swap bit.
 *
 * `null` when it changes nothing: a phone that is not the host asking, a pick
 * after beat zero — two people mid-run are two people who have already
 * agreed — or the host asking for the seat it already holds. Otherwise the
 * new value of the bit, which is always the other one: a swap swaps.
 */
export function seatSwap(
  me: Asking,
  wanted: PlayerId,
  startMs: number,
  swapped: boolean,
): boolean | null {
  if (!me.host || startMs !== 0 || wanted === me.player) return null;
  return !swapped;
}

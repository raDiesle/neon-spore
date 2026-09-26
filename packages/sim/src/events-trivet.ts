import type { TrivetAsk } from "./trivet.js";

/**
 * What THE TRIVET says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. The stand stands over the middle, so every one is there; the ones
 * about a foot say which with `side`, the pilot's nought and the navigator's
 * one.
 */

interface TrivetColEvent {
  /** The column it happened over. */
  col: number;
}

export type TrivetEvent =
  /** The stand drops in, both feet lifted, the hub dark. */
  | ({ type: "trivetEnter" } & TrivetColEvent)
  /** A step lit: a foot's chord, a shot at the hub, or both chords to keep it down. */
  | ({ type: "trivetLight"; ask: TrivetAsk } & TrivetColEvent)
  /** A pad lifted in a lit chord step: the count starts over. */
  | ({ type: "trivetSlip"; side: 0 | 1 } & TrivetColEvent)
  /** A foot planted; `level` is how far home it is now. */
  | ({ type: "trivetPlant"; side: 0 | 1; level: number } & TrivetColEvent)
  /** A one-foot chord step ran out: the foot springs back up, to be tried again. */
  | ({ type: "trivetSpring"; side: 0 | 1 } & TrivetColEvent)
  /** Both feet driven home and the hub lights. */
  | ({ type: "trivetHub" } & TrivetColEvent)
  /** The hub shot in its colour; `hits` is how many it has taken. */
  | ({ type: "trivetHit"; hits: number } & TrivetColEvent)
  /** Both feet replanted under the hub. */
  | ({ type: "trivetBrace" } & TrivetColEvent)
  /** A `both` step ran out: the hub rocks back up, to be held down again. */
  | ({ type: "trivetRock" } & TrivetColEvent)
  /** A fire step ran out with the hub unshot: the hull takes it. */
  | ({ type: "trivetMiss" } & TrivetColEvent)
  /** The script is done and all three feet buckle at once. */
  | ({ type: "trivetCollapse" } & TrivetColEvent)
  /** The collapsed stand has fallen `trivetCollapseBeats`; the wave may end. */
  | ({ type: "trivetOut" } & TrivetColEvent);

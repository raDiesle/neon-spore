import type { Color } from "./types.js";

/**
 * **Everything THE GORGE does that neither screen already says**, as events.
 *
 * Its own file on `events-warden.ts`' terms — one boss taken apart rather
 * than incidents that share a body — and one arm of `SimEvent`, so every
 * consumer still switches over the whole list.
 *
 * What every bubble wants and holds, which is due and where the ring stands
 * are all read off `GorgeState` every frame (`gorge.ts`). What is *not* in
 * the world a frame later is the moment a shot went in, came out or came
 * back, a tap, a turn, a level sated — so each of these is one such edge,
 * and each names the column it happened in, because a column is the whole
 * of what the pair has to say to each other.
 */

/** A column's worth of THE GORGE, for the events that name one. */
interface GorgeColEvent {
  /** The column the bubble hangs over. */
  col: number;
  /** The row, from the top, a shot meets it on — lower on a ring (`gorgeRowOf`). */
  row: number;
}

export type GorgeEvent =
  /** A level's bubbles are in, `width` of them from `col` onward, all empty. */
  | ({ type: "gorgeSettle"; width: number } & GorgeColEvent)
  /** A shot of the colour wanted went in; `beads` is what the bubble holds now. */
  | ({ type: "gorgeSwallow"; color: Color; beads: number } & GorgeColEvent)
  /** A colour it did not want went in and took a shot back out; `beads` is what is left. */
  | ({ type: "gorgeEmptied"; beads: number } & GorgeColEvent)
  /** The bubble has everything it wants; `color` is the shot that finished it. */
  | ({ type: "gorgeFull"; color: Color } & GorgeColEvent)
  /** A shot into a bubble out of turn, or a shut one, came back down `col` as a body of `color`. */
  | ({ type: "gorgeSpit"; color: Color } & GorgeColEvent)
  /** Player 1 tapped the bubble at the bottom of the ring; `left` more taps open it. */
  | ({ type: "gorgeTap"; left: number } & GorgeColEvent)
  /** The ring turned a step, and a new bubble is at the bottom over `col`. */
  | ({ type: "gorgeTurn" } & GorgeColEvent)
  /** Every bubble of level `level` is sated. */
  | ({ type: "gorgeCleared"; level: number } & GorgeColEvent)
  /** The last level is sated: `beads` leave at once, and the fight is over. */
  | ({ type: "gorgeOut"; beads: number } & GorgeColEvent);

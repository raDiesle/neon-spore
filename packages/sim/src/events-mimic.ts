import type { Color } from "./types.js";

/**
 * What THE MIMIC says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the middle column the mantle hangs over, for the
 * sounds to pan to. A seat is `side`, nought the pilot; `signs` are the sign
 * each seat must draw, -1 with none (`mimic.ts`).
 */

interface MimicColEvent {
  /** The column it happened over. */
  col: number;
}

export type MimicEvent =
  /** The mottle at the top of the field begins to slap into shape. */
  | ({ type: "mimicEnter" } & MimicColEvent)
  /** A sign surfaces, or two on a split skin. */
  | ({ type: "mimicSign"; signs: [number, number] } & MimicColEvent)
  /** A changing sign sinks and another rises in its place. */
  | ({ type: "mimicChange"; signs: [number, number] } & MimicColEvent)
  /** `side` drew its sign right and it peeled; `peels` is how many are off in all. */
  | ({ type: "mimicPeel"; side: 0 | 1; sign: number; peels: number } & MimicColEvent)
  /** `side` drew `drawn` for `sign`: the skin wears it. */
  | ({ type: "mimicWrong"; side: 0 | 1; drawn: number; sign: number } & MimicColEvent)
  /** A sign's window ran out with nothing drawn: the skin goes back to mottle. */
  | ({ type: "mimicLapse" } & MimicColEvent)
  /** An arm reached a step down the field; `reaches` this movement. */
  | ({ type: "mimicReach"; reaches: number } & MimicColEvent)
  /** The mimic rolls over between movements. */
  | ({ type: "mimicRoll" } & MimicColEvent)
  /** The core is bare and lit in `color`. */
  | ({ type: "mimicCore"; color: Color | "either" } & MimicColEvent)
  /** The core shot in its colour; `hits` is how many it has taken. */
  | ({ type: "mimicHit"; hits: number } & MimicColEvent)
  /** The core's window ran out: the skin closes over it. */
  | ({ type: "mimicClose" } & MimicColEvent)
  /** The script is done: the mimic loses its shape. */
  | ({ type: "mimicSpent" } & MimicColEvent)
  /** The spent mimic has fallen `mimicSpentBeats`; the wave may end. */
  | ({ type: "mimicOut" } & MimicColEvent);

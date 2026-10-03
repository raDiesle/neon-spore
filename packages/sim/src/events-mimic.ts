import type { Color } from "./types.js";

/**
 * What THE MIMIC says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the middle column the mantle hangs over, for the
 * sounds to pan to. A seat is `side`, nought the pilot; `signs` are the
 * picture each seat must paint, -1 with none (`mimic.ts`).
 */

interface MimicColEvent {
  /** The column it happened over. */
  col: number;
}

export type MimicEvent =
  /** The mottle at the top of the field begins to slap into shape. */
  | ({ type: "mimicEnter" } & MimicColEvent)
  /** A picture is put up, or two on a split board. */
  | ({ type: "mimicSign"; signs: [number, number] } & MimicColEvent)
  /** A changing picture gives way to another, the paint left where it was. */
  | ({ type: "mimicChange"; signs: [number, number] } & MimicColEvent)
  /** The pair's brush is set to `brush`, 1 to 4 (`THROAT_MODES` index plus one). */
  | ({ type: "mimicBrush"; brush: number } & MimicColEvent)
  /** `side` tapped tile `at` and it is now `paint`, 0 bare. */
  | ({ type: "mimicPaint"; side: 0 | 1; at: number; paint: number } & MimicColEvent)
  /**
   * `side` painted its picture exactly and it peeled: picture `sign` in
   * `ink`, its top left on tile `at`; `peels` is how many are off in all.
   */
  | ({
      type: "mimicPeel";
      side: 0 | 1;
      sign: number;
      ink: number;
      at: number;
      peels: number;
    } & MimicColEvent)
  /** A picture's window ran out unpainted: the skin goes back to mottle. */
  | ({ type: "mimicLapse" } & MimicColEvent)
  /** An arm reached a step down the field; `reaches` this movement. */
  | ({ type: "mimicReach"; reaches: number } & MimicColEvent)
  /** The mimic rolls over between movements. */
  | ({ type: "mimicRoll" } & MimicColEvent)
  /** The core is bare and lit in `color`. */
  | ({ type: "mimicCore"; color: Color | "either" } & MimicColEvent)
  /** The core tapped in its colour; `hits` is how many it has taken. */
  | ({ type: "mimicHit"; hits: number } & MimicColEvent)
  /** The core's window ran out: the skin closes over it. */
  | ({ type: "mimicClose" } & MimicColEvent)
  /** The script is done: the mimic loses its shape. */
  | ({ type: "mimicSpent" } & MimicColEvent)
  /** The spent mimic has fallen `mimicSpentBeats`; the wave may end. */
  | ({ type: "mimicOut" } & MimicColEvent);

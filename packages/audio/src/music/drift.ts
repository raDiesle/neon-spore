/**
 * `line` and `pulse`, with the grid taken out.
 *
 * `model.ts`'s three arrangers all take beat positions, so every note in every
 * theme written with them sits on a grid. That is right for five of the six in
 * `themes.ts` and it is the reason none of them can sound like water: what
 * reads as liquid is **drift** — two slow rates that do not divide into each
 * other, so the thing wanders and never quite arrives.
 *
 * The trick is already proven in this repository in another medium. `DRIFT` in
 * `tools/shape-sheet/src/motions/plane.ts` is exactly two non-dividing
 * frequencies, and its note says so in one line: it wanders instead of rocking.
 * This is the same idea with beats instead of radians, and it is deliberately
 * a *third* arranger beside the other three rather than a change to them —
 * nothing already written moves.
 */

import type { SoundDef } from "../types.js";
import type { Note, Shape } from "./model.js";
import { step } from "./model.js";

export interface Wander {
  /** Beats from the top of the piece to the first note. */
  from: number;
  /** Beats between notes — the first rate. Rarely a whole number. */
  every: number;
  count: number;
  degrees: readonly number[];
  /** How far the degree index steps per note. Never a whole number, or it is a loop. */
  turn: number;
  /** Beats per cycle of the loudness swell — the second rate, and the point. */
  swell?: number;
  depth?: number;
  /** Beats per cycle of the stereo drift — a third rate, so it is not a line. */
  sway?: number;
  gain?: number;
  shape?: Shape;
}

/**
 * A stream of notes on a rate that drifts against itself.
 *
 * Three periods run at once — when a note lands, which degree it takes, how
 * loud it is and where it is — and none of them divides into another, so the
 * stream states no bar and arrives at no downbeat. `test/deep.test.ts` holds
 * the result to that as arithmetic rather than by ear: the intervals between
 * onsets have to take many distinct values, and none of them may be most of
 * the piece.
 */
export function wander(voice: SoundDef, w: Wander): Note[] {
  const base = w.gain ?? 1;
  const depth = w.depth ?? 0;
  return Array.from({ length: w.count }, (_, i) => {
    const at = w.from + i * w.every;
    const degree = w.degrees[Math.floor(i * w.turn) % w.degrees.length] ?? 0;
    const loud = w.swell ? Math.sin((2 * Math.PI * at) / w.swell) : 0;
    const side = w.sway ? Math.sin((2 * Math.PI * at) / w.sway) * 0.55 : 0;
    return {
      at,
      cell: voice,
      pitch: step(degree) * (w.shape?.pitch ?? 1),
      gain: base * (1 + depth * loud),
      pan: side,
    };
  });
}

/**
 * The same phrase said again from further away, and on the other side.
 *
 * A room, in one line. The offset is in beats and is meant to be a number that
 * subdivides nothing, so the reflection arrives from a wall whose distance
 * cannot be counted out.
 */
export const echo = (notes: readonly Note[], after: number, gain: number): Note[] =>
  notes.map((n) => ({ ...n, at: n.at + after, gain: (n.gain ?? 1) * gain, pan: -(n.pan ?? 0) }));

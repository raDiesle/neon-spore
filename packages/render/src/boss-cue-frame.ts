import type { BossCue } from "./boss-cue-shape.js";
import type { Layout } from "./layout.js";

/**
 * **How far a cue's frame reaches**, and the one way a reading builds a cue.
 *
 * Until 29 September 2026 each of the thirty-nine `boss-cue-read*.ts` pages
 * wrote its own `HALF_W` and `HALF_H`, and seventeen of them their own
 * `markAt` — the owner, that day: *make all those controls reusable, so
 * changes later on are easier* (`docs/controls-catalogue.md`). There are two
 * sizes, and a page names the one it uses; a third is a new mark, not a new
 * pair of numbers on a page. `packages/sim/test/copies-table.ts` holds the
 * arithmetic here.
 */

/** A frame's half-extent, in tiles. */
export interface CueFrameSize {
  readonly w: number;
  readonly h: number;
}

/** THE CHOIR's frame: the first shipped, and the size a pair has already met. */
export const CUE_FRAME: CueFrameSize = { w: 0.72, h: 0.66 };

/** The frame of every reading from THE GIMBAL on: wider, for a longer word. */
export const CUE_FRAME_WIDE: CueFrameSize = { w: 0.9, h: 0.62 };

/** A frame in canvas pixels; `wide` stretches it across a whole body. */
export function cueFrame(
  l: Layout,
  size: CueFrameSize = CUE_FRAME,
  wide = 1,
): { halfW: number; halfH: number } {
  return { halfW: l.tile * size.w * wide, halfH: l.tile * size.h };
}

/** One cue in THE CHOIR's frame, at a point. */
export function markAt(
  seat: BossCue["seat"],
  kind: BossCue["kind"],
  word: string,
  x: number,
  y: number,
  l: Layout,
  seed: number,
  wide = 1,
): BossCue {
  return { seat, kind, word, x, y, ...cueFrame(l, CUE_FRAME, wide), seed };
}

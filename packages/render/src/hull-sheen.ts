import type { HullSkin } from "./hull.js";
import type { Layout } from "./layout.js";
import { bloom, dither, innerLight, iridescence, sweep } from "./sheen.js";

/**
 * WHAT THE SHIP'S SKIN IS MADE OF, AS A RECORD.
 *
 * `drawHull` called the five passes in `sheen.ts` by name, one after another,
 * inside one clip — which meant the *material* of the hull had nowhere for a
 * second answer to sit. Its contour is `HULL`, its colours are a `HullSkin`,
 * its light is `HULL_LIGHT`; the one thing that decides whether the membrane
 * reads as a soap film, a wet lip or a crust was five function calls in a row.
 * The owner asked on 10 September 2026 for a whole new ship — *anything else
 * you can completely be creative* — and a whole new ship is mostly a new skin,
 * so this is the seam, the tenth of `magnet-look.ts`'s kind.
 *
 * The shipped record is exactly what `drawHull` did, in the order it did it,
 * and nothing else in this file draws. `sheen.ts` keeps the passes.
 */

/** Everything the material is handed: the membrane's outline, the filled body
 * under it, and where the skin is at any x. It is drawn inside a clip to
 * `filled`, so nothing here can reach outside the ship. */
export interface SheenPass {
  readonly ctx: CanvasRenderingContext2D;
  readonly l: Layout;
  /** The wall clock in seconds; everything here is a pure function of it. */
  readonly time: number;
  /** The contour alone, for a pass that strokes along it. */
  readonly body: Path2D;
  /** The contour closed down to the hull's bottom, for a pass that fills. */
  readonly filled: Path2D;
  /** The skin's y above a screen x, without the cannon lobe on it. */
  readonly skinY: (x: number) => number;
  /** Whose ship this is, so a material can be painted in the seat's colours
   * rather than reaching for a palette (`seat-skin.ts`). The shipped passes
   * take their colours from the film and ignore it. */
  readonly skin: HullSkin;
}

export interface HullSheen {
  passes(s: SheenPass): void;
}

/** The shipped material: bioluminescence under the skin, a lit inner rim, a
 * soap film across the field, one travelling highlight, and a grain over all of
 * it so the gradient never bands. */
export function membrane(s: SheenPass): void {
  const { ctx, l, time, body, filled, skinY } = s;
  bloom(ctx, l, time, skinY);
  innerLight(ctx, body);
  iridescence(ctx, body, l, time);
  sweep(ctx, body, l, time);
  dither(ctx, filled);
}

export const HULL_SHEEN: HullSheen = { passes: membrane };

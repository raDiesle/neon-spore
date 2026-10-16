import type { Layout } from "./layout.js";
import { skyFor } from "./skies.js";

/**
 * THE ONE RECORD A CANDIDATE **BACKDROP** PATCHES.
 *
 * `echo-look.ts`'s kind, and the same reasons: a record rather than a named
 * function, so a candidate look is a field patched onto it for the length of
 * one `draw()` and the call site never learns anything about it
 * (`docs/versus.md`).
 *
 * **One field, and it is the whole of the back.** What a pair is asked about
 * is the picture behind the field, and the ground under all of it —
 * `field.ts`'s radial fill — is painted before this runs, so a look that
 * wants a different dark paints its own over it.
 *
 * The back was a sea until 16 October 2026 — a wash, light shafts, a horizon
 * band, two depths of dust and one light in the corner. The owner called it
 * *boring and empty*, liked all six skies VERSUS offered for it, and asked for
 * more and for the game to go round them: the back is now the wave's sky
 * (`skies.ts`), one of twelve.
 */

/** Everything the back is drawn from, in the phone's own pixels. */
export interface BackdropDraw {
  readonly ctx: CanvasRenderingContext2D;
  readonly l: Layout;
  /** Which wave, for its sky and the act's tint — world state, already the
   * same on both screens. */
  readonly wave: number;
  /** Own-motion's clock in seconds, never the wall's (`renderer.ts`). */
  readonly time: number;
}

/** The back as it ships: the wave's sky. */
export function shipped(d: BackdropDraw): void {
  skyFor(d.wave).draw(d);
}

export interface BackdropLook {
  /** What is behind the field, over the ground and under the grid. */
  readonly back: (d: BackdropDraw) => void;
}

export const BACKDROP_LOOK: BackdropLook = { back: shipped };

/** The field's back, through the record — `field.ts`'s one call. */
export function drawBackdrop(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  wave: number,
  time: number,
): void {
  BACKDROP_LOOK.back({ ctx, l, wave, time });
}

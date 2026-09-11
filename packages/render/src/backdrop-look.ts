import { drawHorizon, drawMotes, drawWash, FAR, FAR_MOTES, NEAR, NEAR_MOTES } from "./backdrop.js";
import { drawCornerLight } from "./corner-light.js";
import type { Layout } from "./layout.js";
import { drawLightShafts } from "./light-shafts.js";

/**
 * THE ONE RECORD A CANDIDATE **BACKDROP** PATCHES.
 *
 * `echo-look.ts`'s kind, and the same reasons: a record rather than a named
 * function, so a candidate look is a field patched onto it for the length of
 * one `draw()` and the call site never learns anything about it
 * (`docs/versus.md`).
 *
 * **One field, and it is the whole of the back.** Everything the two players
 * read sits on one backdrop that had never been argued with — a wash, three
 * shafts of light, a horizon band and two depths of dust, laid down in that
 * order under every wave since the field first had a back. The pieces are
 * `backdrop.ts`'s and `light-shafts.ts`'s and are not in question; what a
 * pair is asked about is **the picture they add up to**, and whether a field
 * with a different one behind it is easier for two people to read at speed.
 * So the record holds the composition and nothing finer: a candidate keeps a
 * layer by calling it and drops one by not, and the ground under all of it —
 * `field.ts`'s radial fill — is painted before this runs, so a look that
 * wants a different dark paints its own over it.
 *
 * **The shipped `back` came through here with not one pixel moved**, and
 * stayed so until 11 September 2026, when the owner decided the slot: the
 * sea stays, and one soft light of the act's tint sits in the bottom-right
 * corner (`corner-light.ts`) — what he kept of NEBULA, asked for by name.
 */

/** Everything the back is drawn from, in the phone's own pixels. */
export interface BackdropDraw {
  readonly ctx: CanvasRenderingContext2D;
  readonly l: Layout;
  /** Which wave, for the act's tint — world state, already the same on both screens. */
  readonly wave: number;
  /** Own-motion's clock in seconds, never the wall's (`renderer.ts`). */
  readonly time: number;
}

/**
 * The back as it ships: the wash, then the one light in the corner under
 * everything that moves, then light reaching the water over both, then the
 * horizon band, then the far dust and the near — a suggestion under the
 * field's other layers, never on top of them.
 */
export function shipped(d: BackdropDraw): void {
  const { ctx, l, wave, time } = d;
  drawWash(ctx, l, wave, time);
  drawCornerLight(d);
  drawLightShafts(ctx, l, time);
  drawHorizon(ctx, l, wave);
  drawMotes(ctx, l, time, FAR, FAR_MOTES);
  drawMotes(ctx, l, time, NEAR, NEAR_MOTES);
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

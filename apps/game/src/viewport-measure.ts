import type { Insets } from "@neon-spore/render";

/** The rectangle actually showing, in CSS pixels, how dense it is, and the
 * strips of it the phone keeps for itself (`safe-area.ts`). */
export interface Viewport {
  width: number;
  height: number;
  dpr: number;
  inset: Insets;
}

/**
 * How big the picture may be right now.
 *
 * `window.innerHeight` is the *layout* viewport, which on a phone includes the
 * strip the address bar is sitting over: it grows by the bar's height the
 * moment the bar collapses and shrinks again when it comes back, and it reports
 * each of those after the fact. `visualViewport` is the rectangle the player
 * can actually see — the bar excluded, the on-screen keyboard excluded — and it
 * reports the change while it is still animating. Where there is no such
 * object, the window's own numbers are all there is.
 *
 * Rounded, because the visual viewport is fractional under a pinch and the
 * renderer is sized in whole pixels.
 *
 * The inset is handed in, not read here: reading it forces a style and layout
 * flush, and this runs on every event of an address bar's slide. `small` is
 * the same kind of reading and is handed in beside it: the height with the
 * bars out (`safe-area.ts`), which the picture is never taller than — so a
 * height frozen for a run can never put the lobes under a bar coming back.
 */
export function measure(inset: Insets, small: number): Viewport {
  const seen = window.visualViewport;
  const height = Math.round(seen?.height ?? window.innerHeight);
  return {
    width: Math.round(seen?.width ?? window.innerWidth),
    height: small > 0 ? Math.min(height, small) : height,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    inset,
  };
}

/**
 * The measurement in two halves, each as one string.
 *
 * *Did anything move* is asked twice in `bindViewport` and about different
 * halves of the answer, and spelling either out as four comparisons is how a
 * field comes to be left out of one of them. Across: the width, the density,
 * and the furniture at the sides. Down: the height and the furniture above and
 * below it — which is the half the address bar moves and the half a run refuses.
 */
export function across(v: Viewport): string {
  return `${v.width}:${v.dpr}:${v.inset.left}:${v.inset.right}`;
}

export function down(v: Viewport): string {
  return `${v.height}:${v.inset.top}:${v.inset.bottom}`;
}

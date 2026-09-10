import { drawWardenSurface, type WardenSurfaceDraw } from "./warden-surface.js";

/**
 * THE ONE RECORD A CANDIDATE WARDEN PATCHES.
 *
 * The eighth of `magnet-look.ts`'s kind and the first on a boss. It began as
 * the armour alone, when the question was what a *plate* is — a line on a
 * circle, or a piece of something with a thickness — and BEVEL answered that
 * on 9 September 2026. The field is now the whole surface: everything drawn
 * on the body between the fill of its material and the door over its eye,
 * because the next question is what the *body* is — a flat ring with marks
 * on it, or a thing with a near side — and a look that answers it has to be
 * free to carry the eyelets, the veins and the fringe round together
 * (`warden-surface.ts`). The contour, the opening cut through it, the eye
 * behind the hatch and the hatch itself stay as they are drawn today.
 *
 * The record lives here rather than at the bottom of `warden-surface.ts` so
 * that file and this one do not import each other, which is the seam every
 * look record in this package sits on.
 */
export interface WardenLook {
  surface(d: WardenSurfaceDraw): void;
}

/** The shipped surface: veins and a wet film under the skin, eyelets set into
 * it, a fringe of cilia off the edge, the two glows along it, and one slab of
 * armour per plate. `warden-surface.ts` holds it. */
export const WARDEN_LOOK: WardenLook = { surface: drawWardenSurface };

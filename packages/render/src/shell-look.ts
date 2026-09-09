import type { CreatureSilhouette } from "@neon-spore/content";
import { drawBareRim, drawPlate, type PlateInk } from "./shell-plate.js";

/**
 * THE ONE RECORD A CANDIDATE **SHELL** PATCHES.
 *
 * `magnet-look.ts`'s kind and the same reasons: a record rather than a named
 * function, so a candidate look is a field patched onto it for the length of
 * one `draw()` and the call site never learns anything about it
 * (`docs/versus.md`).
 *
 * **Two fields, and it has to be two.** A shell is drawn as an armoured half
 * beside a bared one for most of its life, and the grey edge the bared half
 * keeps is *the same material* as the plate next to it — cut from the body's
 * own contour instead of the plating's, and that is the only difference. A
 * look that moved one and not the other would put a body on the field wearing
 * two answers, which is not a thing the pair could vote on. So a candidate
 * patches both or it is not a candidate for this slot, and
 * `tools/versus/test/variants.test.ts`'s rule that every candidate in a slot
 * patches the same fields is what holds it to that.
 *
 * What is deliberately *not* here is where a plate goes. `shell-cut.ts` owns
 * the arc, the split and the crack, and a look reaches them through
 * `platePaths` — arguing about the light while quietly moving the armour is a
 * difference the pair would see and could not name.
 */
export interface ShellLook {
  /** One plate over a half that still carries armour. */
  readonly plate: (
    ctx: CanvasRenderingContext2D,
    s: CreatureSilhouette,
    piece: number,
    seed: number,
    t: number,
    ink: PlateInk,
  ) => void;
  /** The grey edge a half that has been chipped keeps, along the body's own
   * contour. */
  readonly bareRim: (
    ctx: CanvasRenderingContext2D,
    s: CreatureSilhouette,
    piece: number,
    t: number,
    ink: PlateInk,
  ) => void;
}

export const SHELL_LOOK: ShellLook = {
  plate: drawPlate,
  bareRim: drawBareRim,
};

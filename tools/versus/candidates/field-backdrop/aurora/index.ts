import * as backdropLook from "../../../../../packages/render/src/backdrop-look.js";
import { patch, type Variant } from "../../../variant.js";
import { aurora } from "./paint.js";

/**
 * `field:backdrop` / `aurora` — curtains of light ripple across the top of the sky.
 *
 * **What the shipped side is.** A sea: light from above, dust in the water,
 * a horizon band, a wash that breathes and one soft light in the corner —
 * which the owner called *boring and empty* on 16 October 2026.
 *
 * **What this argues.** That a back can move without anything on it travelling: a curtain folds
 * in place, so the sky is alive on every frame and the field still never
 * looks like it is flying.
 *
 * **How it can lose.** Motion behind moving bodies. If a player's eye goes to a fold of the
 * curtain rather than to a slick arriving through it, the curtain is too
 * bright or too fast — and its green must never be mistaken for the
 * shield's cyan.
 */
export const BACKDROP_AURORA: Variant = {
  slot: "field:backdrop",
  name: "aurora",
  sentence:
    "two curtains of light hang across the upper sky — a far rose one and a nearer pale green one, each brightest along a hem that waves sideways and folds, fading upward into a starry black; the lower half is left to the stars",
  dir: "tools/versus/candidates/field-backdrop/aurora",
  patches: [
    patch({
      target: backdropLook.BACKDROP_LOOK,
      // No accessor: `drawBackdrop` reads the export itself.
      reached: () => backdropLook.BACKDROP_LOOK,
      where: {
        file: "packages/render/src/backdrop-look.ts",
        symbol: "BACKDROP_LOOK",
        type: "BackdropLook",
      },
      fields: { back: aurora },
    }),
  ],
  // A back is on every frame and one instant of it is the whole question.
  screenshot: { freezeSeconds: 1 },
};

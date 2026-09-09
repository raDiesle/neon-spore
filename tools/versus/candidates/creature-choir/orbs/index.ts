import * as choirLook from "../../../../../packages/render/src/choir-look.js";
import { patch, type Variant } from "../../../variant.js";
import { orbs } from "./paint.js";

/**
 * `creature:choir` / `orbs` — the two voices are bodies, and the film is only
 * what holds them.
 *
 * The shipped membrane is one translucent wash with a solid rim, traced through
 * a metaball field so that two bodies make one skin with a waist in it. It is
 * right about everything it was built to be right about — it is two, it is one
 * tile, and it hides nothing behind it — and the two bodies inside it are
 * **implied and never drawn**. What says there are two of them is the waist in
 * the outline and the two halos underneath; the inside of the skin is empty,
 * so at 26 px a membrane reads as one grey lozenge with a dent in its side.
 *
 * ORBS draws them. Each voice gets a rim walked in nine stops whose brightness
 * is `surfaceLit` read at the bearing the surface is edge-on in, six cells
 * pinned at fixed longitudes and carried round by a turn of its own, and one
 * specular that stays upper-left while all of that travels underneath. The
 * membrane keeps its traced outline and loses its wash: the two bubbles are
 * what says there is something in there, and a film over them would be a second
 * skin between the pair and the thing they are being asked to look at.
 *
 * **It is more see-through, not less.** Every mark is additive or a stroke and
 * nothing is a fill, which is how a soap bubble is actually lit — light where
 * the surface takes it and nothing where it does not. The owner's complaint
 * that killed two earlier drafts was that the body hid what was behind it, and
 * a 0.34 wash across the whole skin is the last thing in this picture that
 * still does.
 *
 * **The turn is the animation and it is the argument.** The cells at the back
 * of a voice come round into view and the ones at the front go away, which is
 * the **reveal** — 22.9 : 1 against the 1.10 : 1 an affine pose manages, and
 * the one depth cue that is a difference in kind rather than of degree
 * (`docs/dimensional.md`). Two grey balls that visibly have a far side are two
 * balls; two grey circles are a diagram.
 *
 * How it can lose. **This creature is answered by neither trigger, and a body
 * that reads as *made of something* is a body that looks answerable.**
 * `PALETTE.rock` is the game's word for *nothing you carry reaches this*, and
 * the flatness of the shipped wash is part of how it says so. If player 2 finds
 * themselves reaching for a trigger at a membrane because it started looking
 * like a body, that is this candidate and it is a gameplay cost, not a taste.
 * The second way is cheaper and just as fatal: six cells a voice, twelve to a
 * membrane, all of them moving, in a body under a fifth of a tile wide — if it
 * reads as fizz rather than as two surfaces, the marks are too small to be
 * carrying the claim at all.
 */
export const CHOIR_ORBS: Variant = {
  slot: "creature:choir",
  name: "orbs",
  sentence:
    "the two voices are drawn as turning bubbles inside the film rather than implied by the waist in it — added light only, so it hides even less than the wash it replaces",
  dir: "tools/versus/candidates/creature-choir/orbs",
  patches: [
    patch({
      target: choirLook.CHOIR_LOOK,
      // No accessor: `drawChoir` reads the export itself. The module namespace
      // is the whole route there is.
      reached: () => choirLook.CHOIR_LOOK,
      where: {
        file: "packages/render/src/choir-look.ts",
        symbol: "CHOIR_LOOK",
        type: "ChoirLook",
      },
      fields: { skin: orbs },
    }),
  ],
};

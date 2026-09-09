import * as gyreLook from "../../../../../packages/render/src/gyre-look.js";
import { patch, type Variant } from "../../../variant.js";
import { yolk } from "./paint.js";

/**
 * `creature:gyre` / `yolk` — the organelle is a ball with things suspended in
 * it, lit by a light that stays where it is.
 *
 * THE GYRE is a wheel with six bodies on its rim and an organelle in the
 * middle, and the middle is the one part of the armature nothing stands on: the
 * rim ratchets because bodies stand on tiles, and the core is free to turn at
 * the wheel's *true* rate, which is what makes it the readout for the maw. So
 * it is the one thing on this creature a look may argue about at all.
 *
 * The shipped organelle turns the whole frame by `flow` and builds its fluid
 * inside it. That is exactly what the depth rule calls the failure that looks
 * like a success: the pale sliver is glued to the membrane, so it travels
 * *with* the surface, and a lit thing whose light turns with it is a painted
 * stone however good the paint is (`docs/style-guide.md`, Depth). The file
 * even says so in its own words — "the highlight sits off to one side of the
 * skin and is carried round by the same rotation the skin is" — which is a
 * clear description of a pose being used where a placement belongs.
 *
 * YOLK takes the turn out for one line. The contour is still turned by `flow`
 * and is still `gyreSkinPath`'s own — called, never re-typed, so the lobe
 * count and the wobble stay one number in one file — but the clip is taken in
 * the turned frame and the shading is drawn in a frame the turn has been
 * removed from. Inside it: a value ramp read off `surfaceLit` across the ball
 * rather than a radial gradient, nine granules pinned at fixed longitudes and
 * carried round by the same `flow`, and one specular upper-left that does not
 * move at all. The granules at the back come into view and the ones at the
 * front go away, which is the reveal — the one depth cue that is a difference
 * in kind rather than of degree (`docs/dimensional.md`).
 *
 * **Nothing about the readout moves.** The aura, the membrane's colour, the
 * `pull` every part of the wheel brightens with and the nucleus at the very
 * centre are the shipped ones, so a pair who cannot tell whether the maw's pull
 * worked still look at the middle of the wheel and still see the swim slow.
 * What changes is whether the swim reads as fluid *in* something or as a lamp
 * with a pattern on it.
 *
 * How it can lose. **The counter-turning iris is gone**, and it was doing a
 * job: it is the one counter-motion on the whole wheel, and `gyre-core.ts` put
 * it in the middle rather than at the rim precisely so a light travelling where
 * the bodies are could not be misread as a body. Granules crossing a fixed
 * highlight travel *with* the wheel, so if the middle now reads as turning the
 * same way as everything else, the wheel has lost the one part of it that said
 * *this is an animal and not a mechanism*. And a nucleus offset toward the
 * light is a nucleus that is no longer exactly in the middle of the wheel — on
 * a body the pair aims six columns off, that is worth one hard look.
 */
export const GYRE_YOLK: Variant = {
  slot: "creature:gyre",
  name: "yolk",
  sentence:
    "the middle of the wheel is a ball with granules suspended in it under a light that stays put — the swim is the surface turning, not a pattern going round",
  dir: "tools/versus/candidates/creature-gyre/yolk",
  patches: [
    patch({
      target: gyreLook.GYRE_LOOK,
      // No accessor: `drawGyre` reads the export itself. The module namespace
      // is the whole route there is.
      reached: () => gyreLook.GYRE_LOOK,
      where: {
        file: "packages/render/src/gyre-look.ts",
        symbol: "GYRE_LOOK",
        type: "GyreLook",
      },
      fields: { core: yolk },
    }),
  ],
};

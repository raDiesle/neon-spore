import * as livingSkin from "../../../../../packages/render/src/living-skin.js";
import { patch, type Variant } from "../../../variant.js";
import { lit } from "./paint.js";

/**
 * `creature:skin` / `lit` — a body with a body in it.
 *
 * Every blob in this game is filled with its own deep and given a glowing rim
 * in its own colour, and the deep is very nearly the background: `redDark` is
 * `#190F2C` against a `#07060F` field. So a creature is, materially, a hole in
 * space with a neon line round the edge of it. That is a real and defensible
 * look — it is where the whole *neon* half of the game's identity comes from —
 * and it is the one thing on the field that has never had a second answer,
 * because until `living-skin.ts` was lifted there was nowhere for one to sit.
 *
 * LIT argues that the hole should be a **solid**. Four changes, in the order
 * they are painted, and each is one clause:
 *
 * **The flesh.** The fill is carried a little under half way from the deep
 * toward the body's own hue, so there is something for a light to act on. A
 * shape filled at `#190F2C` cannot have a terminator on it, and every
 * three-dimensional read in `docs/style-guide.md` starts with one.
 *
 * **A rim inside the contour**, in the palette's own rim colour for that hue,
 * drawn before the light so the far half of it is taken back down. That is the
 * bevel order the style guide names: a bright edge painted *after* the ramp is
 * a ring on a dark side, which reads as a sticker rather than as a surface.
 *
 * **The shipped key light over it**, through `litRound` at the shipped `KEY`,
 * with the transform's own rotation undone — so a throb turning and a dart
 * leaning move *under* a light that stays where it is. Nothing here invents a
 * light angle, and the candidate is not allowed to: which material a body is
 * made of is a look, where the sun is, is not.
 *
 * **And a sheen**, a soft gather of the body's own hue under the lit shoulder,
 * in the hue and never in white. `key-light.ts` refuses `lift` on a creature
 * because brightening moves a red body a measurable distance toward cyan, and
 * a highlight is the surface where that would cost the most.
 *
 * The neon edge is untouched. It is the identity of the whole game, and it is
 * the one thing on this body that is *state* rather than material — a body
 * shot in the wrong colour is a grey outline, and that branch of
 * `drawLiving` never reaches this file at all.
 *
 * How it can lose, and all three are about the same thing — the field is not
 * one body. **Eleven columns of solids is a brighter field than eleven columns
 * of holes**, and the ship, the shots and the shield all have to stay legible
 * over it; the style guide's *only creatures may be the brightest thing* is a
 * rule about one creature, not about a wave of them. **A filled body is a
 * bigger body**, and drawn size is the axis `nameability.ts` measures on: a
 * slick that reads a size larger is a slick nearer a bulb. And **the deep is
 * doing work nobody has named** — a body that is nearly background is a body
 * the eye reads as *far away*, and `hazed` spends distance on the palette
 * assuming it. Four kinds are on the pose at once for exactly these reasons.
 */
export const SKIN_LIT: Variant = {
  slot: "creature:skin",
  name: "lit",
  sentence:
    "flesh instead of a hole — a fill that carries the body's own colour, a rim inside the contour, and the shipped key light over both",
  dir: "tools/versus/candidates/creature-skin/lit",
  patches: [
    patch({
      target: livingSkin.LIVING_SKIN,
      // No accessor: `drawLiving` reads the export itself, once per body per
      // frame. The module namespace is the whole route there is.
      reached: () => livingSkin.LIVING_SKIN,
      where: {
        file: "packages/render/src/living-skin.ts",
        symbol: "LIVING_SKIN",
        type: "LivingSkin",
      },
      fields: { paint: lit },
    }),
  ],
};

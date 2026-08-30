import { bleedPass } from "../skins/parts.js";
import type { Glow } from "./types.js";

/**
 * Optical glare: bright pixels bleeding softly into what is around them.
 *
 * The standard engine term, and the one the owner named first. It is
 * `auraPass` opened up — six times the spread, a fifth of the opacity, two
 * more passes — and it is literally that function rather than a second copy of
 * it, because the whole value of having BLOOM on the page beside a skin that
 * draws an aura is that the difference between them is the numbers.
 *
 * Under the skin. A bloom drawn on top of its own outline softens the one edge
 * the whole catalogue is judged by, which is the effect drawn wrong rather
 * than a stronger version of it.
 *
 * The opacities were first set at a third of what they are, on the reasoning
 * that a bleed should be felt rather than seen. On the page that produced a
 * cell indistinguishable from NONE — which is not subtlety, it is an axis with
 * a value on it that says nothing. A look being offered has to be visible
 * enough to be refused.
 */
const PASSES = 5;
/** As a fraction of the body's half-extent. Wide enough to read as light
 * spilling rather than as a thicker line, which is what the aura already is. */
const SPREAD = 0.34;

export const BLOOM: Glow<"bloom"> = {
  id: "bloom",
  label: "BLOOM",
  hint: "bright pixels bleed softly outward — the standard engine term for optical glare",
  layer: "under",
  spread: SPREAD * 0.6,
  build(ctx) {
    bleedPass(ctx, ctx.reach * SPREAD, PASSES, 0.07, 0.03);
  },
};

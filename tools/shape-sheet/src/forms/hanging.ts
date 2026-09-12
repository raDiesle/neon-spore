import { catmullRomToBezierPath, SAC_SKIN, type SacSkin, sacPoints } from "@neon-spore/content";
import type { Subject } from "../contour.js";

/**
 * The forms for a body whose mass has gone downward.
 *
 * Split out of `forms.ts` when that one was full, along a seam worth keeping
 * now that it is a directory: everything here is a shape that has *given way*,
 * which is a thing two of the drafts are entirely about. THE WEIGHT hangs off a
 * stalk and the HUSK is a pod that has died, and neither is describable as a
 * blob with a parameter turned up.
 *
 * Both husk variants are built here, and they are the same question asked at
 * two strengths. A husk has to pass for a pod while it hangs — one that
 * announces itself is free to ignore, and free to ignore is not a decision —
 * so the drawing is not trying to be legible, it is trying to find the point
 * where legibility starts. `sac` is the gentle answer and `slumped` is the
 * loud one; the pair on the page is the measurement.
 */

const N = 64;

// `SacSkin`, `SAC_SKIN` and the sac's own points live in
// `packages/content/src/silhouettes-gum.ts` now: THE GUM wears THE WEIGHT's
// sac on the field, and the card here is drawn from the same points so the
// two cannot drift apart. Re-exported so nothing that reached for the skin
// through this file had to move.
export { SAC_SKIN, type SacSkin };

/**
 * A sac: a blob with its mass pulled downward, hanging rather than floating.
 * `bias` 0 is an ordinary blob; 0.5 is a teardrop with a narrow top.
 *
 * Screen y grows downward, so the widening is at `sin(a) > 0` — the bottom.
 *
 * `skin` exists for the one case where a sac has to be *somebody else's*
 * contour with the mass moved: the HUSK is drawn from the pod's own lobes,
 * depth, wobble and seed, so at `bias` 0 the two cards are the same picture and
 * every difference on the page is the sag and nothing else. A sag drawn on a
 * different skin would be a comparison of two shapes rather than of one shape
 * before and after, which is not the question the draft is asking.
 */
export function sac(
  name: string,
  note: string,
  bias: number,
  rx: number,
  ry: number,
  skin: SacSkin = SAC_SKIN,
): Subject {
  return {
    name,
    note,
    open: false,
    pointsAt: (t) => sacPoints(t, bias, rx, ry, skin, N),
    path: catmullRomToBezierPath,
  };
}

/**
 * A sac with a shoulder fallen in: the same sag, plus a dent where an intact
 * body has a crown.
 *
 * The louder of the two husk variants. `sac` moves mass and changes no
 * landmark, so the difference from a pod is a proportion and an eye has
 * nothing to point at; this cuts one, which is far easier to see — and that is
 * exactly its risk, because a husk legible while it hangs never has to be
 * gambled on. The dent is off-centre on purpose: a symmetrical one reads as a
 * shape the thing was built with, and a lopsided one reads as damage.
 *
 * `crown` is how deep the dent goes, as a fraction of the radius.
 */
export function slumped(
  name: string,
  note: string,
  bias: number,
  crown: number,
  rx: number,
  ry: number,
  skin: SacSkin = SAC_SKIN,
): Subject {
  // Where the shoulder falls in, and how wide the dent is, are the contour's own
  // two numbers now (`packages/content/src/silhouettes-gum.ts`): THE WEIGHT
  // wears this form on the field, so the card and the body are drawn from one
  // place and cannot disagree about where the damage is.
  return {
    name,
    note,
    open: false,
    // The dent lives with the sac's own loop in
    // `packages/content/src/silhouettes-weight.ts`' neighbour now — THE WEIGHT
    // wears this form on the field, and the card is drawn from the same points
    // so the two cannot drift apart, exactly as the gum's sac is.
    pointsAt: (t) => sacPoints(t, bias, rx, ry, skin, N, crown),
    path: catmullRomToBezierPath,
  };
}

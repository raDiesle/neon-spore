import { blobRadiusMul, type Point } from "./shapes.js";

/**
 * **The sac**: the contour every hanging body is cut from, taken off the shape
 * sheet whole.
 *
 * `tools/shape-sheet/src/forms/hanging.ts` draws a *sac* — a blob with its
 * mass pulled downward, `bias` 0 an ordinary blob and 0.5 a teardrop with a
 * narrow top. THE WEIGHT wears it slumped (`silhouettes-weight.ts`), and the
 * sheet imports `sacPoints` back from this file so the card and the body
 * cannot drift apart. It was THE GUM's body too until THE GUM was taken out of
 * the game on 10 October 2026.
 */

/** The lobing a sac is cut from — the sheet's `SAC_SKIN`, which every sac on
 * the page has worn since the HUSK draft took the pod's own skin instead. */
export interface SacSkin {
  lobes: number;
  depth: number;
  wobble: number;
  seed: number;
}

export const SAC_SKIN: SacSkin = { lobes: 2, depth: 0.1, wobble: 0.05, seed: 1.7 };

/**
 * Where a slumped sac's shoulder falls in, and how wide the dent is — up and a
 * little to one side, which is a shoulder rather than the top of a head. The
 * shape sheet's own `slumped` draft is drawn from these two numbers, so the card
 * and the body cannot disagree about where the damage is.
 *
 * Off-centre on purpose: a symmetrical dent reads as a shape the thing was built
 * with, and a lopsided one reads as a mass that has given way.
 */
const CROWN_AT = -Math.PI / 2 + 0.75;
const CROWN_WIDTH = 0.5;

/** Signed shortest angle from `a` to `to`, in radians. */
function angleDiff(a: number, to: number): number {
  let d = a - to;
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/**
 * One sac's contour at time `t`, centred on the origin, `n` points round.
 * Screen y grows downward, so the widening is at `sin(a) > 0` — the bottom.
 *
 * `crown` is how far the shoulder has fallen in, as a fraction of the radius,
 * and nought is the plain sac. It is an argument here rather than a second
 * function in the shape sheet because the sheet's drafts and the bodies are
 * drawn from it — the plain sac at nought, THE WEIGHT at its own depth — and
 * two copies of this loop would be two answers to what a sac is
 * (`copies-table.ts`).
 */
export function sacPoints(
  t: number,
  bias: number,
  rx: number,
  ry: number,
  skin: SacSkin = SAC_SKIN,
  n = 64,
  crown = 0,
): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const d = angleDiff(a, CROWN_AT) / CROWN_WIDTH;
    const dent = crown === 0 ? 1 : 1 - crown * Math.exp(-d * d);
    const m =
      blobRadiusMul(a, skin.lobes, skin.depth, skin.wobble, t, skin.seed) *
      (1 + bias * Math.sin(a)) *
      dent;
    pts.push({ x: Math.cos(a) * rx * m, y: Math.sin(a) * ry * m });
  }
  return pts;
}

import { walkedSilhouette } from "./body-form.js";
import { blobRadiusMul, type Point } from "./shapes.js";
import type { CreatureSilhouette } from "./silhouettes.js";

/**
 * **THE GUM in the air: THE WEIGHT's sac**, taken off the shape sheet whole.
 *
 * `tools/shape-sheet/src/forms/hanging.ts` draws a *sac* — a blob with its
 * mass pulled downward, `bias` 0 an ordinary blob and 0.5 a teardrop with a
 * narrow top — and THE WEIGHT's card is that form at 0.46 on a two-lobed skin.
 * A gum is a sac before anything else: a heavy drop that has not yet landed
 * on the thing it will stick to. So the body is the draft's own contour
 * rather than a new one, named here as `creature:gum` / `sac`, and the sheet
 * imports `sacPoints` back from this file so the card and the body cannot
 * drift apart.
 *
 * Nothing the game already draws is a sac: SLICK and BULB are level, the
 * beatbox is a cabinet, and the rest of the roster is one of those two under
 * something (`silhouettes.ts`).
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

/** One sac's contour at time `t`, centred on the origin, `n` points round.
 * Screen y grows downward, so the widening is at `sin(a) > 0` — the bottom. */
export function sacPoints(
  t: number,
  bias: number,
  rx: number,
  ry: number,
  skin: SacSkin = SAC_SKIN,
  n = 64,
): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const m =
      blobRadiusMul(a, skin.lobes, skin.depth, skin.wobble, t, skin.seed) *
      (1 + bias * Math.sin(a));
    pts.push({ x: Math.cos(a) * rx * m, y: Math.sin(a) * ry * m });
  }
  return pts;
}

/** THE WEIGHT's three numbers: the sag, and a body taller than it is wide. */
const GUM_BIAS = 0.46;
const GUM_RX = 74;
const GUM_RY = 96;

/** A sac's mass hangs below its origin by `bias * ry`; the field draws a body
 * about its cell's centre, so the contour is lifted by that much here and the
 * drop sits on its row rather than a third of a tile under it. */
const GUM_LIFT = GUM_BIAS * GUM_RY;

export const GUM: CreatureSilhouette = walkedSilhouette({ ...SAC_SKIN }, (t) =>
  sacPoints(t, GUM_BIAS, GUM_RX, GUM_RY).map((p) => ({ x: p.x, y: p.y - GUM_LIFT })),
);

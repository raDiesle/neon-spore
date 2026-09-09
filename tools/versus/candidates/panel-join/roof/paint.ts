import { HULL, hullAngleAtX, hullRadiusMul } from "../../../../../packages/content/src/index.js";
import type { CeilingRise } from "../../../../../packages/render/src/band-join.js";
import { hullClock, hullSpan } from "../../../../../packages/render/src/hull-frame.js";

/**
 * The paint ROOF is made of, kept out of `index.ts` so that file stays the
 * argument for the candidate rather than a wall of arithmetic.
 *
 * There is no canvas in here at all, which is what makes this the cheapest
 * candidate on the page: the roof is a *shape*, and a shape is one number per
 * sampled x. `band-seam.ts` samples it forty-eight times across the width and
 * splines the result, exactly as it does for the shipped wobble.
 */

/**
 * How much of the hull's own ripple the panel's roof takes.
 *
 * One, and it is not a tuning knob so much as the whole claim: the underside of
 * the ship is the ship. A share below one would be a roof that *resembles* the
 * hull, which is a different and weaker sentence — and the two would drift the
 * moment `HULL` was tuned, because only one of them would move.
 */
const FOLLOW = 1;

/**
 * The panel's roof, read off the hull's own radius function at the same screen
 * x the ship above is drawn at.
 *
 * Every number in it is **called**: `hullSpan` and `hullClock` are the ellipse
 * and the clock `hull-frame.ts` measures the ship with, `hullAngleAtX` is the
 * one map from a screen x to a place on that ellipse, and `HULL`'s three fields
 * are the ripple itself. A hand copy of any of them would be a panel that
 * rippled at a rate the ship did not, which is the exact failure this candidate
 * exists to fix, arrived at from the other side.
 *
 * The multiplier comes back around 1, swinging by about `depth + wobble` either
 * way; the rise this record wants is 0 at the lowest and 1 at the highest, so
 * that swing is normalised by its own two fields rather than by a constant.
 */
export const ripple: CeilingRise = (l, x, time) => {
  const { cx, rx } = hullSpan(l);
  const a = hullAngleAtX(x, cx, rx);
  const m = hullRadiusMul(a, HULL.lobes, HULL.depth, HULL.wobble, hullClock(time), HULL.seed);
  const swing = Math.max(1e-3, HULL.depth + HULL.wobble);
  const rise = 0.5 + (FOLLOW * (m - 1)) / (2 * swing);
  return Math.max(0, Math.min(1, rise));
};

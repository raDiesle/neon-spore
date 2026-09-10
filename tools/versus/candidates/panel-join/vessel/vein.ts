import { openSmoothPath, type Point } from "../../../../../packages/content/src/index.js";

export { curve, tube } from "../../../tube.js";

import { hash01 } from "../../../../../packages/render/src/backdrop.js";
import type { Circle } from "../../../../../packages/render/src/layout.js";

/**
 * The geometry VESSEL is drawn out of, kept out of `paint.ts` so that file
 * stays the tree and the paint rather than a page of vector arithmetic — and
 * because `paint.ts` had grown past the 250-line ceiling CLAUDE.md holds every
 * file to, which is a split waiting to happen along a seam that was already
 * there.
 *
 * Nothing in here knows what a control is or what colour a seat has. It is
 * points, offsets and one Catmull-Rom, and every one of them is a pure function
 * of its arguments.
 */

/** The controls this panel carries, left to right and two to a trunk. A seat
 * with an odd control gets a trunk of its own for the last one, which is what a
 * body does with an organ it cannot pair. */
export function groups(lobes: readonly Circle[]): Circle[][] {
  const sorted = [...lobes].sort((a, b) => a.x - b.x);
  const out: Circle[][] = [];
  for (let i = 0; i < sorted.length; i += 2) out.push(sorted.slice(i, i + 2));
  return out;
}

/** How many capillaries leave one branch. */
const SPRAY = 5;

/**
 * The smallest vessels: hairs leaving a branch and dying out in the tissue.
 *
 * They are what stops the tree reading as plumbing. A pipe has one thickness
 * and ends where it is going; a vessel has every thickness at once and most of
 * it goes nowhere in particular.
 */
export function sprays(c: Circle, mid: readonly Point[], r: number, g: number): string {
  let d = "";
  for (let i = 0; i < SPRAY; i++) {
    const seed = g * 61 + i * 17 + Math.round(c.x);
    const at = mid[Math.min(mid.length - 1, 3 + Math.floor(hash01(seed) * (mid.length - 6)))];
    if (!at) continue;
    const side = i % 2 === 0 ? -1 : 1;
    const reach = r * (0.5 + hash01(seed + 5) * 1.2) * side;
    const fall = r * (0.3 + hash01(seed + 9) * 1.0);
    // A capillary is sampled and splined like everything else here rather than
    // written as one quadratic. A quadratic whose control point sits near the
    // line between its ends is a straight scratch however short it is, and the
    // first pass of this put seven of them across the panel.
    const hairs: Point[] = [];
    for (let s = 0; s <= 6; s++) {
      const t = s / 6;
      hairs.push({
        x: at.x + reach * Math.sin((t * Math.PI) / 2) - reach * 0.22 * t * t,
        y: at.y + fall * t * t * (1.6 - 0.6 * t),
      });
    }
    d += openSmoothPath(hairs);
  }
  return d;
}

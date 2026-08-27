import { blobRadiusMul, catmullRomToBezierPath, type Point } from "@neon-spore/content";
import type { Subject } from "../contour.js";

/**
 * The forms for a body that is **held to something** rather than floating in
 * the field.
 *
 * Every other form here is a free body: it hangs, it leans, it comes apart,
 * but nothing outside it is part of the picture. These two are the opposite,
 * and both were drawn from the same observation in another game's art — the
 * enemy that is a hole in the floor with something coming out of it, and the
 * one that is a bulb pinned down by roots. In both, the anchor is not scenery
 * behind the creature; it is a piece of the silhouette, and removing it leaves
 * a shape that says nothing.
 *
 * The seam is worth its own file for the reason `index.ts` gives: the
 * asymmetry here is **fixed**, not a bearing. `hooked` and `heeled` are
 * asymmetric because the body has decided which way to go and will decide
 * again; a breach opens upward for as long as it exists, and a root hangs
 * down. Sampling is otherwise the same one-radius-per-angle the rest use, so
 * these breathe on the same three wobble layers as everything on the sheet.
 */

const N = 64;

/** Shortest signed distance from `a` to `b` around the circle. */
function angleDiff(a: number, b: number): number {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/**
 * A body pushing up through a hole, with the torn rim curling back at both
 * ends.
 *
 * Screen y grows downward, so the flat edge is at the bottom: the contour is
 * an ordinary lobed dome above the lip and a straight cut across it, which is
 * what makes the shape read as *a thing in an opening* rather than as a body
 * that happens to be flat underneath. The two ends lift and flare, because a
 * hole with a clean edge reads as a door and a hole with a torn one reads as
 * damage — and damage is the point: this is the ship's own hull failing.
 *
 * `lip` is where the cut sits, as a fraction of `ry` from the centre, so 0.35
 * is a body mostly above its opening and 0.8 is one barely emerged. `swell` is
 * how far it rises and falls through the lip over `period` seconds — the one
 * thing on the card that says the hole is producing something rather than
 * holding it.
 */
export function welling(
  name: string,
  note: string,
  rx: number,
  ry: number,
  lip: number,
  swell: number,
  period: number,
): Subject {
  // Wide enough that 64 samples put several points into each curl, narrow
  // enough that the lift stays at the ends rather than bowing the whole cut.
  const END = 0.45;
  return {
    name,
    note,
    open: false,
    pointsAt(t) {
      const rise = 1 + swell * Math.sin((t / period) * Math.PI * 2);
      const lipY = ry * lip;
      const pts: Point[] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const m = blobRadiusMul(a, 3, 0.14, 0.05, t, 9.4);
        const x = Math.cos(a) * rx * m;
        const y = Math.sin(a) * ry * m * rise;
        if (y <= lipY) {
          pts.push({ x, y });
          continue;
        }
        // Below the lip the contour stops being the body and becomes the rim:
        // flat across, lifted and flared where it was torn.
        const left = angleDiff(a, Math.PI) / END;
        const right = angleDiff(a, 0) / END;
        const end = Math.exp(-left * left) + Math.exp(-right * right);
        pts.push({ x: x * (1 + 0.22 * end), y: lipY - ry * 0.3 * end });
      }
      return pts;
    },
    path: catmullRomToBezierPath,
  };
}

/**
 * A bulb held down by roots: a round body with narrow tendrils reaching from
 * its underside, drifting but never letting go.
 *
 * The roots are cut into the silhouette rather than drawn under it, on the
 * same rule `glyphed` follows — the outline is all there is at 26 px, and a
 * tendril that is an inner detail is no tendril at all. They are deliberately
 * *narrow*: a body with fat lower lobes is the slick, and the whole claim of
 * this shape is that the thing is attached, which reads only if what attaches
 * it is thinner than what it attaches.
 *
 * `roots` is how many, `reach` how far past the body they go as a fraction of
 * the radius, and `drift` how much they wander over `period` seconds. Nothing
 * here detaches: the drift is bounded well under `reach`, so the shortest a
 * root ever gets is still a root.
 */
export function rooted(
  name: string,
  note: string,
  rx: number,
  ry: number,
  roots: number,
  reach: number,
  drift: number,
  period: number,
): Subject {
  return {
    name,
    note,
    open: false,
    pointsAt(t) {
      const pts: Point[] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        // Only the underside grows roots, and it fades in rather than starting
        // at the equator: a tendril leaving the side of the body would read as
        // a limb, which is a different animal.
        const under = Math.max(0, Math.sin(a)) ** 2;
        // Raised to a high power so each one is a spike and not a lobe.
        const comb = Math.max(0, Math.cos(roots * a)) ** 10;
        const wander = 1 + drift * Math.sin((t / period) * Math.PI * 2 + a * 3);
        const m = blobRadiusMul(a, 2, 0.08, 0.04, t, 11.6) * (1 + reach * under * comb * wander);
        pts.push({ x: Math.cos(a) * rx * m, y: Math.sin(a) * ry * m });
      }
      return pts;
    },
    path: catmullRomToBezierPath,
  };
}

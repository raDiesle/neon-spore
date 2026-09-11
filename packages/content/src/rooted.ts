import type { Point } from "./shapes.js";
import { blobRadiusMul } from "./shapes.js";

/**
 * A bulb held down by roots: a round body with narrow tendrils reaching from
 * its underside, drifting but never letting go — the contour alone.
 *
 * Moved here from `tools/shape-sheet/src/forms/anchored.ts` when the game
 * itself needed it: THE GYRE's mounts wear this rim turned to face the hub
 * (`render/mount-taproot.ts`, adopted from VERSUS on 11 September 2026), and
 * a package cannot import a tool. The shape sheet's `rooted` is now a subject
 * wrapped round this, so the card and the creature are one arithmetic — the
 * same move `studded.ts` made for the rind's burr. Why the roots are cut into
 * the silhouette rather than drawn under it, and why they are narrow, stays
 * in the sheet's file, which is where a reader choosing a form goes.
 */
export interface RootedOpts {
  rx: number;
  ry: number;
  /** How many roots the underside grows. */
  roots: number;
  /** How far one reaches past the body, as a fraction of the radius. */
  reach: number;
  /** How much a root wanders over `period` seconds — well under `reach`, so
   * the shortest a root ever gets is still a root. */
  drift: number;
  period: number;
}

const N = 64;

/** The rim at a moment `t`, in seconds, centred on the origin, roots down. */
export function rootedContour(o: RootedOpts): (t: number) => Point[] {
  const { rx, ry, roots, reach, drift, period } = o;
  return (t) => {
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
  };
}

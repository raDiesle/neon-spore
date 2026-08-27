import { blobRadiusMul, catmullRomToBezierPath, type Point } from "@neon-spore/content";
import type { Subject } from "./contour.js";

/**
 * The one contour form whose outline carries a **direction**.
 *
 * It lives beside `forms.ts` rather than in it for the ordinary reason — that
 * file was full — but the seam is a real one. Every other form there is either
 * symmetric or symmetric-with-a-wobble, which is right for anything that holds
 * its lane and useless for the Notch, whose whole mechanic is that it takes a
 * different column on the next accent and the pair has to say so before it
 * does. A creature that has a facing needs a silhouette that has one.
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
 * A body with a barb, and the barb points where the body is going.
 *
 * The one form here whose outline carries a *direction*. Every other shape in
 * the catalogue is either symmetric or symmetric-with-a-wobble, which is right
 * for anything that holds its lane — and useless for the Notch, whose whole
 * mechanic is that it takes a different column next accent and the pair has to
 * say so before it does.
 *
 * The barb retracts to nothing before it comes out on the other side, so the
 * silhouette never jumps: a body that visibly *commits*, rather than one that
 * pops between two poses. `reach` is how far past the body the tip goes, as a
 * fraction of the radius; `period` is a full there-and-back, so a commitment
 * lasts half of it.
 */
export function hooked(
  name: string,
  note: string,
  rx: number,
  ry: number,
  reach: number,
  period: number,
): Subject {
  // Narrow enough to read as a point rather than a lump, wide enough that 64
  // samples put seven of them across it.
  const WIDTH = 0.34;
  return {
    name,
    note,
    open: false,
    pointsAt(t) {
      const p = (((t % period) + period) % period) / period;
      const half = p < 0.5 ? p / 0.5 : (p - 0.5) / 0.5;
      // Out fast, held for most of the commitment, back in at the end.
      const extend = Math.max(0, Math.min(1, Math.sin(half * Math.PI) * 1.6));
      const bearing = p < 0.5 ? 0 : Math.PI;
      const pts: Point[] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const d = angleDiff(a, bearing) / WIDTH;
        const barb = Math.exp(-d * d);
        const m = blobRadiusMul(a, 3, 0.16, 0.05, t, 5.2) * (1 + reach * extend * barb);
        pts.push({ x: Math.cos(a) * rx * m, y: Math.sin(a) * ry * m });
      }
      return pts;
    },
    path: catmullRomToBezierPath,
  };
}

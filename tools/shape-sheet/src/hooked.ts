import { blobRadiusMul, catmullRomToBezierPath, type Point } from "@neon-spore/content";
import type { Subject } from "./contour.js";

/**
 * The contour forms whose outline carries a **direction**.
 *
 * They live beside `forms.ts` rather than in it for the ordinary reason — that
 * file was full — but the seam is a real one. Every form there is either
 * symmetric or symmetric-with-a-wobble, which is right for anything that holds
 * its lane and useless for the Notch, whose whole mechanic is that it takes a
 * different column on the next accent and the pair has to say so before it
 * does. A creature that has a facing needs a silhouette that has one.
 *
 * There are two of them because there are two ways to say "that way" with an
 * outline, and nobody knows which survives 26 px. `hooked` puts the direction
 * in a small feature — a barb, which is unmistakable and might simply vanish at
 * creature size. `heeled` puts it in the whole body — a mass that leans, which
 * cannot vanish and might read as one more wobble beside the bulb's sway. They
 * share `commitment` so both cards turn on exactly the same beats, and the only
 * difference on the page is where the direction is carried.
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
 * Which way the body has committed, and how far into that commitment it is.
 *
 * `extend` returns to zero before the bearing flips, so nothing that reads it
 * ever jumps: a body that visibly *decides*, rather than one that pops between
 * two poses. `period` is a full there-and-back, so one commitment lasts half of
 * it — 2.5 s at the draft's tuning, which is four beats at 96 BPM and so one
 * accent, the beat the Notch would re-pick its column on.
 */
function commitment(t: number, period: number): { bearing: number; extend: number } {
  const p = (((t % period) + period) % period) / period;
  const half = p < 0.5 ? p / 0.5 : (p - 0.5) / 0.5;
  return {
    bearing: p < 0.5 ? 0 : Math.PI,
    // Out fast, held for most of the commitment, back in at the end.
    extend: Math.max(0, Math.min(1, Math.sin(half * Math.PI) * 1.6)),
  };
}

/**
 * Variant 1: a body with a barb, and the barb points where the body is going.
 *
 * The direction is a *feature* — one spike on an otherwise ordinary contour, so
 * a player reading the shape has a single thing to find. `reach` is how far past
 * the body the tip goes, as a fraction of the radius.
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
      const { bearing, extend } = commitment(t, period);
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

/**
 * Variant 2: no barb — the whole mass leans the way the body is going.
 *
 * The direction is the *body*, not a feature on it: the contour fattens on the
 * leading side and narrows behind, so there is nothing small enough to be lost
 * at 26 px. What it risks instead is the opposite failure — the bulb already
 * sways and the slick already tilts, and a lopsided blob may read as one more
 * of those rather than as a claim about which column comes next.
 *
 * `heel` is how far the balance shifts, as a fraction of the radius. It is
 * bounded well under 1 so the trailing side never pinches to a point: a body
 * that has committed is still a body.
 */
export function heeled(
  name: string,
  note: string,
  rx: number,
  ry: number,
  heel: number,
  period: number,
): Subject {
  return {
    name,
    note,
    open: false,
    pointsAt(t) {
      const { bearing, extend } = commitment(t, period);
      const pts: Point[] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        // One cosine lobe about the bearing: fat in front, lean behind, and
        // no discontinuity anywhere, which is what keeps it a body.
        const lean = 1 + heel * extend * Math.cos(angleDiff(a, bearing));
        const m = blobRadiusMul(a, 3, 0.16, 0.05, t, 5.2) * lean;
        pts.push({ x: Math.cos(a) * rx * m, y: Math.sin(a) * ry * m });
      }
      return pts;
    },
    path: catmullRomToBezierPath,
  };
}

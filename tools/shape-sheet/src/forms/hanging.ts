import { blobRadiusMul, catmullRomToBezierPath, type Point } from "@neon-spore/content";
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

/** The lobing a sac is cut from, where the default two-lobed one is wrong. */
export interface SacSkin {
  lobes: number;
  depth: number;
  wobble: number;
  seed: number;
}

const SAC_SKIN: SacSkin = { lobes: 2, depth: 0.1, wobble: 0.05, seed: 1.7 };

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
    pointsAt(t) {
      const pts: Point[] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const m =
          blobRadiusMul(a, skin.lobes, skin.depth, skin.wobble, t, skin.seed) *
          (1 + bias * Math.sin(a));
        pts.push({ x: Math.cos(a) * rx * m, y: Math.sin(a) * ry * m });
      }
      return pts;
    },
    path: catmullRomToBezierPath,
  };
}

/** Shortest signed distance from `a` to `b` around the circle. */
function angleDiff(a: number, b: number): number {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
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
  // Up and a little to one side: the shoulder, not the top of the head.
  const AT = -Math.PI / 2 + 0.75;
  const WIDTH = 0.5;
  return {
    name,
    note,
    open: false,
    pointsAt(t) {
      const pts: Point[] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const d = angleDiff(a, AT) / WIDTH;
        const dent = 1 - crown * Math.exp(-d * d);
        const m =
          blobRadiusMul(a, skin.lobes, skin.depth, skin.wobble, t, skin.seed) *
          (1 + bias * Math.sin(a)) *
          dent;
        pts.push({ x: Math.cos(a) * rx * m, y: Math.sin(a) * ry * m });
      }
      return pts;
    },
    path: catmullRomToBezierPath,
  };
}

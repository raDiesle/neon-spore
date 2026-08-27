import { catmullRomToBezierPath, hullRadiusMul, type Point } from "@neon-spore/content";
import type { Subject } from "./subjects.js";

/**
 * The ring: the one contour in this game with a hole through it.
 *
 * It lives beside `subjects.ts` rather than inside it because it is the only
 * shape made of two loops, and because `subjects.ts` answers "what does the
 * game draw" — a ring is drawn by nothing yet. It is `forms.ts`'s sibling in
 * every other respect, and separate from it only for length; `drafts/bosses.ts`
 * is where one gets tuned, and this is only how one is built.
 *
 * The hole is handed out as points rather than as a finished subpath, because
 * everything that reads a subject reads points — the metrics subtract its
 * area, the sheets and the director's card stroke it as a second loop, and
 * only the filled still needs it as a subpath, under `fill-rule="evenodd"`.
 * Even-odd cuts the hole whichever way the loop winds, which is why nothing
 * anywhere has to reverse one.
 */

/**
 * The lobes of one loop of a ring. A ring is two of these — an outer body and
 * a pupil cut out of it — and they are tuned separately on purpose: the game
 * has no other shape whose inside can be more restless than its outside.
 */
export interface RingLobes {
  lobes: number;
  depth: number;
  wobble: number;
  seed: number;
}

export interface RingSilhouette {
  outer: RingLobes;
  pupil: RingLobes;
  rx: number;
  ry: number;
  /** Pupil radius as a fraction of the body's, before anything dilates it. */
  pupilMul: number;
  /** How far off centre the pupil sits, in fractions of `rx`. */
  pupilDx: number;
}

/**
 * A body with a hole through it, sampled through the same `hullRadiusMul`
 * every living contour on this sheet uses — so the pupil breathes by the same
 * arithmetic as the body around it, and neither can drift from the game.
 *
 * The hole is a full loop of its own rather than a scaled copy of the outer
 * one. A ring whose inside merely repeats its outside reads as a washer; the
 * point of this shape is that the two edges disagree.
 */
export function ring(name: string, s: RingSilhouette, note: string): Subject {
  const loop = (l: RingLobes, rx: number, ry: number, dx: number, t: number): Point[] => {
    const pts: Point[] = [];
    const N = 40;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const m = hullRadiusMul(a, l.lobes, l.depth, l.wobble, t, l.seed);
      pts.push({ x: dx + Math.cos(a) * rx * m, y: Math.sin(a) * ry * m });
    }
    return pts;
  };
  return {
    name,
    note,
    open: false,
    pointsAt: (t) => loop(s.outer, s.rx, s.ry, 0, t),
    hole: (t) => loop(s.pupil, s.rx * s.pupilMul, s.ry * s.pupilMul, s.pupilDx * s.rx, t),
    path: catmullRomToBezierPath,
  };
}

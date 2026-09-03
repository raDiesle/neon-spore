import {
  type CreatureSilhouette,
  catmullRomToBezierPath,
  hullRadiusMul,
  type Point,
  type RingSilhouette,
  WARDEN_PUPIL_OPEN,
  WARDEN_RING,
  wardenOpening,
} from "@neon-spore/content";
import type { Subject } from "./contour.js";

export type { RingSilhouette };

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
 * The shape itself now lives in `packages/content` — the game draws THE WARDEN,
 * so its parameters belong where every other drawn silhouette's do and this
 * sheet reads the same copy the canvas does. What is left here is only how one
 * is built out of points.
 */

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
  const loop = (l: CreatureSilhouette, rx: number, ry: number, dx: number, t: number): Point[] => {
    const pts: Point[] = [];
    const N = 40;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const m = hullRadiusMul(a, l.lobes, l.depth, l.wobble, t, l.seed);
      pts.push({ x: dx + Math.cos(a) * rx * m, y: Math.sin(a) * ry * m });
    }
    return pts;
  };
  const outer = (t: number): Point[] => loop(s.outer, s.outer.rx, s.outer.ry, 0, t);
  const pupil = (t: number): Point[] =>
    loop(s.pupil, s.outer.rx * s.pupilMul, s.outer.ry * s.pupilMul, s.pupilTravel * s.outer.rx, t);
  return {
    name,
    note,
    open: false,
    pointsAt: outer,
    hole: pupil,
    // What is *drawn* is the body with the way in cut through it — one loop,
    // `wardenOpening`, the same call the canvas makes. `pointsAt` and `hole`
    // stay the two loops it is built from, because that is what the metrics
    // mean: the clearance a pupil keeps from the rim is still the number six
    // parameters can quietly destroy, opening or no opening.
    loopsAt: (t) => {
      const cut = wardenOpening(outer(t), pupil(t), 0, 0);
      return cut === null ? [outer(t), pupil(t)] : [cut.contour];
    },
    path: catmullRomToBezierPath,
  };
}

/**
 * THE WARDEN's ring at a named point of the pupil's travel — `at` is 0 at home
 * and 1 at the edge, the same number the canvas derives from the pupil's
 * column, so a pose here cannot show an offset the game can never reach.
 */
function warden(name: string, note: string, at: number, pupilMul = WARDEN_RING.pupilMul): Subject {
  return ring(name, { ...WARDEN_RING, pupilMul, pupilTravel: WARDEN_RING.pupilTravel * at }, note);
}

/**
 * The three poses of it worth judging apart, and there is no fourth. A still
 * cannot show a slide, and GLARE — the last phase — is the open pupil at rest,
 * which would be the third card twice.
 */
export const WARDEN_POSES: Subject[] = [
  // Not dead centre: a hole exactly in the middle of a ring reads as a washer,
  // and the pupil is only ever at home for the one beat it passes through.
  warden("WARDEN", "8 lobes · pupil of 5 · a hole you see the field through", 0.36),
  warden("WARDEN · LOOKING", "the pupil run out to the edge of its travel", 1),
  warden("WARDEN · OPEN", "the two beats the core is exposed", 0.2, WARDEN_PUPIL_OPEN),
];

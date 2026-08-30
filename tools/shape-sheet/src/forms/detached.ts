import { blobRadiusMul, catmullRomToBezierPath, type Point } from "@neon-spore/content";
import type { Subject } from "../contour.js";

/**
 * A body and a piece that is not part of it.
 *
 * Converted off Nova Drift's enemy line-up — `docs/tower-defence.md` — which is
 * drawn as white silhouettes on dark and is therefore the strictest possible
 * test of the thing this project cares about. Most of that line-up is already
 * in this catalogue under other names. One arrangement is not: a body with a
 * **detached arc standing over it**, held at a distance, touching nothing.
 *
 * `cluster` is the near miss and is a different claim. Its bodies are the same
 * body several times and their whole event is *merging* — the card exists to
 * show a contour becoming one. These two loops never merge, are not the same
 * shape as each other, and the interesting state is the one where the second
 * one is **gone**: a guard that has been broken off, with the body still there
 * and now bare. That is `shell` and `THE CANOPY` at creature scale, and it is
 * the only way this catalogue can draw a body whose protection is a separate
 * object rather than a thickness.
 *
 * `held` is the whole parameter. At 1 the arc is at its drawn distance, at 0
 * it is gone — and the card is judged on whether the body underneath reads as
 * *exposed* rather than merely as smaller.
 */
export interface GuardedOpts {
  /** The body's radius. */
  r: number;
  /**
   * The arc's radius, in body radii. Above 1 it stands clear of the body,
   * which is the only interesting case: an arc at 1 is a rim.
   */
  span: number;
  /** How much of a circle the arc covers, in radians. */
  sweep: number;
  /** Thickness of the arc, in radii. */
  thick: number;
  /** 1 the guard is there, 0 it has been broken off. */
  held: number;
  lobes?: number;
  seed?: number;
}

const BODY_N = 72;
const ARC_N = 26;

export function guarded(name: string, note: string, o: GuardedOpts): Subject {
  const seed = o.seed ?? 9.2;

  const body = (t: number): Point[] => {
    const pts: Point[] = [];
    for (let i = 0; i < BODY_N; i++) {
      const a = (i / BODY_N) * Math.PI * 2;
      const m = blobRadiusMul(a, o.lobes ?? 3, 0.07, 0.04, t, seed);
      pts.push({ x: Math.cos(a) * o.r * m, y: Math.sin(a) * o.r * m });
    }
    return pts;
  };

  const guard = (t: number): Point[] => {
    // Concentric with the body, so `span` is the whole of how far it stands
    // clear. It rides a little on a slower clock than the body's wobble, so
    // the two read as separate objects rather than as one shape with a gap.
    const ride = 1 + Math.sin(t * 0.42) * 0.05;
    const outer = o.r * o.span * ride;
    const inner = outer - o.r * o.thick;
    const pts: Point[] = [];
    const half = o.sweep / 2;
    // Out along the top, back along the underside, so the arc is a piece with
    // a thickness rather than a stroke. A guard drawn as a line is a line; a
    // guard drawn as a body is something that can be broken off.
    for (let i = 0; i <= ARC_N; i++) {
      const a = -Math.PI / 2 - half + (i / ARC_N) * o.sweep;
      pts.push({ x: Math.cos(a) * outer, y: Math.sin(a) * outer });
    }
    for (let i = ARC_N; i >= 0; i--) {
      const a = -Math.PI / 2 - half + (i / ARC_N) * o.sweep;
      pts.push({ x: Math.cos(a) * inner, y: Math.sin(a) * inner });
    }
    return pts;
  };

  const loopsAt = (t: number): Point[][] => (o.held > 0.01 ? [body(t), guard(t)] : [body(t)]);

  return {
    name,
    note,
    open: false,
    loopsAt,
    pointsAt: (t) => loopsAt(t).flat(),
    path: catmullRomToBezierPath,
  };
}

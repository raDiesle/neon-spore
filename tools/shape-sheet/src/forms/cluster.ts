import { catmullRomToBezierPath, type Point } from "@neon-spore/content";
import type { Subject } from "../contour.js";
import { isoLoops, resampleAll } from "../iso.js";

/** Points a traced loop is resampled to, whatever length the trace came out. */
const LOOP_POINTS = 64;

export interface ClusterOpts {
  /** How many bodies. Two reads as a pair, three as a chorus. */
  bodies: number;
  /** Radius of one body. */
  radius: number;
  /** How far apart they sit at their widest, as a multiple of `radius`. */
  spread: number;
  /** Seconds for one apart-and-back-together cycle. */
  period: number;
  /** How close together they get: 0 is fully merged, 1 never merges. */
  floor: number;
}

/**
 * Several bodies inside one membrane, drifting apart and coming back together.
 *
 * The outline is a metaball field — each body contributes `r²/d²`, and the
 * contour is where the sum crosses 1 — traced by `isoLoops` rather than
 * marched radially from the middle. That is the whole difference: a radial
 * march has one answer per angle and so can only ever return one ring, which
 * is why this used to thin to a waist and stop. Traced on a grid, the bodies
 * separate when the field between them says they have, into as many loops as
 * there are bodies, and merge back the same way. Symbiosis and The Choir both
 * hang their mechanic on that instant being visible.
 *
 * The bodies breathe slightly out of step with each other, which is what keeps
 * a merged cluster from reading as one rigid blob with a dent in it.
 */
export function cluster(name: string, note: string, o: ClusterOpts): Subject {
  const centresAt = (t: number): Point[] => {
    // A raised cosine: apart for most of the cycle, together briefly. The
    // merged instant is the rare one, which is what makes it an event.
    const phase = (1 - Math.cos((t / o.period) * Math.PI * 2)) / 2;
    const apart = o.radius * o.spread * (o.floor + (1 - o.floor) * phase);
    const centres: Point[] = [];
    for (let i = 0; i < o.bodies; i++) {
      const a = (i / o.bodies) * Math.PI * 2 + t * 0.21;
      centres.push({ x: Math.cos(a) * apart, y: Math.sin(a) * apart * 0.7 });
    }
    return centres;
  };

  const loopsAt = (t: number): Point[][] => {
    const centres = centresAt(t);
    const radii = centres.map((_, i) => o.radius * (1 + 0.05 * Math.sin(t * 1.4 + i * 2.3)));
    const field = (x: number, y: number): number => {
      let f = 0;
      for (let i = 0; i < centres.length; i++) {
        const c = centres[i]!;
        const r = radii[i]!;
        f += (r * r) / Math.max((x - c.x) ** 2 + (y - c.y) ** 2, 1);
      }
      return f;
    };
    // A body's own isosurface sits at `r`, so a margin of two radii clears the
    // widest a merged pair ever bulges and costs a grid this size nothing.
    let reach = 0;
    for (const c of centres) reach = Math.max(reach, Math.hypot(c.x, c.y));
    const half = reach + o.radius * 2;
    const box = { x0: -half, x1: half, y0: -half, y1: half };
    return resampleAll(isoLoops(field, box), LOOP_POINTS);
  };

  return {
    name,
    note,
    open: false,
    loopsAt,
    pointsAt: (t) => loopsAt(t).flat(),
    path: catmullRomToBezierPath,
  };
}

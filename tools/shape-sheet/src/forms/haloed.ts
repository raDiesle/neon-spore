import { blobRadiusMul, catmullRomToBezierPath, type Point } from "@neon-spore/content";
import type { Subject } from "../contour.js";

/**
 * A ring with nodes standing on it, and the nodes travel.
 *
 * Converted off Neon Pulsefire's arena boss — `docs/tower-defence.md` — which
 * is a core inside a circle of orbiting satellites. That body is very nearly
 * THE WARDEN arrived at independently, which is the reason to draw it and the
 * reason to be careful with it: what it has that ours does not is **motion in
 * the outline itself**. The warden's hole slides because the design says so;
 * this ring's opening travels because the whole rim is turning, and a gap
 * between two moving nodes is a different thing to point at than a gap that is
 * moved.
 *
 * So `spin` is the parameter this form exists for. Everything else here is
 * arrangement.
 *
 * It is not `ring.ts` with bumps. `ring.ts` builds THE WARDEN out of the
 * parameters `packages/content` ships, so that the sheet and the canvas cannot
 * disagree about a shape the game draws; this is a proposal about a shape
 * nothing draws, and giving it a `RingSilhouette` would mean inventing content
 * for it. The hole is the only thing the two share, and it is eight lines.
 */
export interface HaloedOpts {
  /** Outer radius before any node is added. */
  r: number;
  /** The hole, as a fraction of `r`. */
  hole: number;
  /** How many nodes stand round the rim. */
  nodes: number;
  /** How far one stands off the rim, as a fraction of `r`. */
  bump: number;
  /** Radians per beat the whole ring of nodes travels. */
  spin: number;
  /**
   * How many consecutive nodes are missing, leaving one wide opening that
   * travels with the rest.
   *
   * A ring of identical nodes says nothing — it is a cog, and a cog turning is
   * indistinguishable from a cog standing still at this size. The absence is
   * what makes the rotation legible, and it is also the only place a mechanic
   * could attach: an opening that comes round is a thing the pair can wait for
   * and say a number about.
   */
  missing?: number;
  seed?: number;
}

const N = 208;
const HOLE_N = 44;

export function haloed(name: string, note: string, o: HaloedOpts): Subject {
  const step = (Math.PI * 2) / o.nodes;
  const seed = o.seed ?? 3.7;
  const missing = o.missing ?? 0;

  return {
    name,
    note,
    open: false,
    pointsAt(t) {
      const travel = t * o.spin;
      const pts: Point[] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        // Which node this angle belongs to, in the ring's own turning frame.
        const local = a - travel;
        const k = ((Math.round(local / step) % o.nodes) + o.nodes) % o.nodes;
        const off = (local - Math.round(local / step) * step) / (step / 2);
        // Nodes 0..missing-1 are simply absent, so the opening is `missing + 1`
        // gaps wide and travels with everything else.
        const there = k >= missing ? 1 : 0;
        const node = Math.max(0, Math.cos((off * Math.PI) / 2)) ** 3.2;
        const m = blobRadiusMul(a, 2, 0.03, 0.02, t, seed) * (1 + o.bump * node * there);
        pts.push({ x: Math.cos(a) * o.r * m, y: Math.sin(a) * o.r * m });
      }
      return pts;
    },
    /**
     * A loop of its own rather than a scaled copy of the outer one, for the
     * reason `ring.ts` gives: a ring whose inside repeats its outside reads as
     * a washer, and the whole point of this shape is that you can see the
     * field through it.
     */
    hole(t) {
      const pts: Point[] = [];
      for (let i = 0; i < HOLE_N; i++) {
        const a = (i / HOLE_N) * Math.PI * 2;
        const m = blobRadiusMul(a, 3, 0.05, 0.03, t, seed + 4.1);
        pts.push({ x: Math.cos(a) * o.r * o.hole * m, y: Math.sin(a) * o.r * o.hole * m });
      }
      return pts;
    },
    path: catmullRomToBezierPath,
  };
}

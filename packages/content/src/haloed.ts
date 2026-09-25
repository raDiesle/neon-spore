import type { Point } from "./shapes.js";
import { blobRadiusMul } from "./shapes.js";

/**
 * A ring with nodes standing on it, the nodes travelling, and one wide gap
 * where some are missing — the contour alone.
 *
 * Moved here from `tools/shape-sheet/src/forms/haloed.ts` when the game
 * itself needed it: player 2's tool on THE FILAMENT wears THE CORONA's card
 * (`render/filament-tools.ts`, 25 September 2026), and a package cannot
 * import a tool. The shape sheet's `haloed` is now a subject wrapped round
 * this, so the card and the tool are one arithmetic — the same move
 * `studded.ts` and `rooted.ts` made. Why `spin` is the parameter the form
 * exists for, and why a gap is what makes a turn legible, stays in the
 * sheet's file, which is where a reader choosing a form goes.
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
  /** How many consecutive nodes are missing, leaving one wide opening. */
  missing?: number;
  seed?: number;
}

/** The outer rim at a moment `t`, centred on the origin, `n` points round. */
export function haloedContour(o: HaloedOpts, t: number, n = 208): Point[] {
  const step = (Math.PI * 2) / o.nodes;
  const seed = o.seed ?? 3.7;
  const missing = o.missing ?? 0;
  const travel = t * o.spin;
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    // Which node this angle belongs to, in the ring's own turning frame.
    const local = a - travel;
    const k = ((Math.round(local / step) % o.nodes) + o.nodes) % o.nodes;
    const off = (local - Math.round(local / step) * step) / (step / 2);
    // Nodes 0..missing-1 are absent, so the opening travels with the rest.
    const there = k >= missing ? 1 : 0;
    const node = Math.max(0, Math.cos((off * Math.PI) / 2)) ** 3.2;
    const m = blobRadiusMul(a, 2, 0.03, 0.02, t, seed) * (1 + o.bump * node * there);
    pts.push({ x: Math.cos(a) * o.r * m, y: Math.sin(a) * o.r * m });
  }
  return pts;
}

/** The hole, a loop of its own so the inside does not repeat the outside. */
export function haloedHole(o: HaloedOpts, t: number, n = 44): Point[] {
  const seed = o.seed ?? 3.7;
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const m = blobRadiusMul(a, 3, 0.05, 0.03, t, seed + 4.1);
    pts.push({ x: Math.cos(a) * o.r * o.hole * m, y: Math.sin(a) * o.r * o.hole * m });
  }
  return pts;
}

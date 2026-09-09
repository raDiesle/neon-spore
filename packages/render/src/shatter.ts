import type { Point } from "@neon-spore/content";
import { stream } from "./hash.js";

/**
 * Cutting a body into the pieces it came apart into.
 *
 * The field's answer to something being destroyed has always been a handful of
 * three-pixel squares thrown outwards (`sparks.ts`). A square says *an event
 * happened here*; it does not say **what came apart**, because it never had the
 * shape of the thing that did. This cuts the real contour instead — the same
 * outline `livingPath` draws the body with — so every piece is a piece *of that
 * body*, and the pieces put back together are the body again with no gaps.
 *
 * That is the whole of the idea and the reason it is geometry and not paint:
 * a fracture that tiles its subject exactly reads as a break, and a scatter of
 * unrelated shapes reads as a particle system however pretty each shape is.
 *
 * **Star-shaped about the origin, and that is a real limit.** A wedge's outer
 * edge is found by casting a ray from the fracture origin and taking the
 * nearest crossing, so a contour that folds back over itself from where the
 * break started loses whatever is behind the fold. Every living body in this
 * game is a lobed blob or a clubbed rim and both are star-shaped from their own
 * middle; a fracture origin pushed far off-centre on a deeply clubbed rim is
 * where this would first show, and the cut degrades into a slightly flattened
 * piece rather than into a tear.
 *
 * **Nothing here is random and nothing here is a clock.** The jitter is
 * `stream`, seeded by the caller, for `sparks.ts`'s reason: two phones watching
 * the same body die must watch the same pieces leave it. Where the pieces then
 * *go* is `shatter-fall.ts`, kept apart because a cut is a fact about a shape
 * and a flight is a fact about time, and the bench (`tools/breaks`) wants to
 * hold one still while it changes the other.
 */

/** One piece of a broken body: its outline, where it started, and how it left. */
export interface Shard {
  /**
   * The piece's own outline, in body-local units **about its own centroid** —
   * so a caller translates to `x, y` and rotates about the origin, which is the
   * only place a spinning piece can be turned about without wobbling.
   */
  readonly points: readonly Point[];
  /** Where that centroid sat while the body was still whole, body-local. */
  readonly x: number;
  readonly y: number;
  /** How it left, body-local units per second. */
  readonly vx: number;
  readonly vy: number;
  /** Radians per second, signed. */
  readonly spin: number;
  /**
   * How far out of the body this piece was, 0 at the fracture origin and 1 at
   * the contour. A paint reads it to darken what was inside — the inside of a
   * body is the one surface the pair has never seen, and a break that shows it
   * in the rim's own colour is a break that shows nothing.
   */
  readonly depth: number;
}

/** How a body is cut. Every field is a number a bench can turn. */
export interface Fracture {
  /** Where the break started, body-local. Pieces leave along the ray from here. */
  readonly ox: number;
  readonly oy: number;
  /** How many wedges the contour is cut into around that origin. */
  readonly wedges: number;
  /**
   * Where the inner ring ends, as a share of each wedge's own reach. At 1 a
   * wedge is one piece from the origin to the rim; below it the wedge is cut
   * again into a core piece and a rind piece, which is the difference between a
   * body quartered and a body *spalled* — the near half shattered small and the
   * far half coming off in slabs.
   */
  readonly innerAt: number;
  /** How fast a piece leaves, body-local units per second. */
  readonly speed: number;
  /** Turn rate, radians per second, before the per-piece jitter. */
  readonly spin: number;
  /** The seed. The same seed cuts the same body the same way, forever. */
  readonly seed: number;
}

/**
 * Samples along one wedge's outer edge.
 *
 * Five and not two, because that edge is a piece of the *body's* outline and
 * not a chord across it: a lobe falling between two cut rays is the whole
 * difference between a piece that still looks like part of a blob and a
 * triangle. A fixed count per wedge rather than a fixed angular density, so a
 * body cut into four and the same body cut into sixteen carry the same
 * fidelity per piece.
 */
const ARC_STEPS = 5;

/** Below this a wedge has no area worth drawing, and is dropped rather than fed
 * to a canvas as a degenerate path. */
const MIN_AREA = 1e-4;

/**
 * How far along the ray from the origin the contour is, at one angle.
 *
 * The nearest crossing and not the furthest: on the star-shaped bodies this is
 * used for there is exactly one, and taking the nearest is what makes a contour
 * that *does* fold back degrade into a flattened piece instead of a piece that
 * swallows the fold.
 */
function reachAt(outline: readonly Point[], ox: number, oy: number, angle: number): number {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let best = 0;
  for (let i = 0; i < outline.length; i++) {
    const p = outline[i] as Point;
    const q = outline[(i + 1) % outline.length] as Point;
    const ex = q.x - p.x;
    const ey = q.y - p.y;
    const den = ex * dy - dx * ey;
    if (den === 0) continue;
    const wx = p.x - ox;
    const wy = p.y - oy;
    const t = (ex * wy - wx * ey) / den;
    const s = (dx * wy - dy * wx) / den;
    if (t <= 0 || s < 0 || s > 1) continue;
    if (best === 0 || t < best) best = t;
  }
  return best;
}

/** The area-weighted middle of a polygon, and its area — one walk for both,
 * because a caller that wants one always wants the other to know whether the
 * piece is worth keeping at all. */
function centroid(pts: readonly Point[]): { x: number; y: number; area: number } {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i] as Point;
    const q = pts[(i + 1) % pts.length] as Point;
    const cross = p.x * q.y - q.x * p.y;
    a += cross;
    cx += (p.x + q.x) * cross;
    cy += (p.y + q.y) * cross;
  }
  a *= 0.5;
  if (Math.abs(a) < MIN_AREA) return { x: 0, y: 0, area: 0 };
  return { x: cx / (6 * a), y: cy / (6 * a), area: Math.abs(a) };
}

/** One piece, finished: recentred on its own middle and given a way to leave. */
function piece(
  pts: Point[],
  f: Fracture,
  rnd: () => number,
  depth: number,
  haste: number,
): Shard | null {
  const c = centroid(pts);
  if (c.area === 0) return null;
  const dx = c.x - f.ox;
  const dy = c.y - f.oy;
  const len = Math.hypot(dx, dy) || 1;
  const speed = f.speed * haste * (0.82 + rnd() * 0.36);
  return {
    points: pts.map((p) => ({ x: p.x - c.x, y: p.y - c.y })),
    x: c.x,
    y: c.y,
    vx: (dx / len) * speed,
    vy: (dy / len) * speed,
    // Signed and jittered together: a ring of pieces all turning the same way
    // reads as a wheel coming off rather than as something breaking.
    spin: f.spin * (rnd() - 0.5) * 2.4,
    depth,
  };
}

/**
 * Cut a closed contour into the pieces it came apart into.
 *
 * `outline` is body-local and centred wherever the drawing code centres it —
 * `livingPoints` puts a body on the origin, which is what every caller here
 * hands in. The pieces come back in the order they were cut, which is the order
 * a paint should draw them in: a fracture is not depth-sorted, and pretending
 * it is costs a sort every frame for a difference nobody sees at a tile and a
 * half across.
 */
export function shatter(outline: readonly Point[], f: Fracture): Shard[] {
  if (outline.length < 3 || f.wedges < 3) return [];
  const rnd = stream(f.seed);
  const out: Shard[] = [];
  const step = (Math.PI * 2) / f.wedges;
  // Every cut ray up front, jittered once, so wedge k and wedge k+1 share the
  // edge between them exactly. Two wedges each jittering their own copy of one
  // boundary is how a fracture grows a seam of open space down the middle.
  const cuts: number[] = [];
  for (let k = 0; k < f.wedges; k++) cuts.push(k * step + (rnd() - 0.5) * step * 0.55);
  const inner = Math.max(0.05, Math.min(1, f.innerAt));

  for (let k = 0; k < f.wedges; k++) {
    const a0 = cuts[k] as number;
    const a1 = (cuts[(k + 1) % f.wedges] as number) + (k === f.wedges - 1 ? Math.PI * 2 : 0);
    const rim: Point[] = [];
    for (let j = 0; j <= ARC_STEPS; j++) {
      const a = a0 + ((a1 - a0) * j) / ARC_STEPS;
      const r = reachAt(outline, f.ox, f.oy, a);
      rim.push({ x: f.ox + Math.cos(a) * r, y: f.oy + Math.sin(a) * r });
    }
    const near = rim.map((p) => ({
      x: f.ox + (p.x - f.ox) * inner,
      y: f.oy + (p.y - f.oy) * inner,
    }));

    // The core piece: the fracture origin and the arc it was cut back to. It
    // was closest to whatever did this, so it leaves fastest.
    //
    // Its depth is the interesting line. With a second ring outside it this
    // piece is *interior* — the surface it shows was never on the outside of
    // anything — so it is dark and carries no lit edge. With no second ring it
    // is the whole wedge, contour and all, and it must keep the rim it is
    // carrying or a body cut coarsely comes apart into slabs of its own inside.
    const core = piece(
      [{ x: f.ox, y: f.oy }, ...near],
      f,
      rnd,
      inner < 0.995 ? inner * 0.5 : 1,
      1.3,
    );
    if (core) out.push(core);
    // And the rind, when there is one: the slab of skin outside the core,
    // carrying the body's real edge and leaving slower for having more of it.
    if (inner < 0.995) {
      const rind = piece([...near, ...[...rim].reverse()], f, rnd, (1 + inner) * 0.5, 0.7);
      if (rind) out.push(rind);
    }
  }
  return out;
}

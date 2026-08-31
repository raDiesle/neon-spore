import type { Point } from "@neon-spore/content";
import type { PartCtx } from "./types.js";

/**
 * The four constructions every part is built out of.
 *
 * They are here rather than in each file because the whole claim of a parts
 * library is that fifty pictures are combinations of a few rules — a stroked
 * spine, a blob, a corner-to-corner polygon and a band cut out of a ring. A
 * part that needed a fifth would be a body wearing a disguise.
 */

/**
 * A part's own coordinates onto the body it hangs off.
 *
 * Local `+x` is out of the body, local `+y` runs along the rim, one unit is
 * the body's radius at the site. This is the only place either of those facts
 * is applied, which is what lets a part be authored once and then rotated,
 * mirrored and scaled by the composer rather than by itself.
 */
export function place(c: PartCtx, pts: Point[]): Point[] {
  const unit = c.site.scale * c.size;
  const co = Math.cos(c.site.out);
  const si = Math.sin(c.site.out);
  return pts.map((p) => {
    const x = p.x * unit;
    const y = p.y * unit * c.flip;
    return { x: c.site.x + x * co - y * si, y: c.site.y + x * si + y * co };
  });
}

export interface SpineOpts {
  /** How far it reaches, in body radii. */
  len: number;
  /** Total bend from root to tip, radians. Positive curls along the rim. */
  curl?: number;
  /** How far the bend travels as it sways, radians. */
  sway?: number;
  /** Bends along its length: 1 is a whip, 3 is a wave train. */
  waves?: number;
  /** Radians per second of the sway. */
  speed?: number;
  /** Segments. More is smoother and none of them is free. */
  n?: number;
}

/**
 * The centre line of anything that reaches: a tentacle, a filament, a stalk.
 *
 * Built by walking a heading rather than by evaluating a curve, because a
 * tentacle's bend accumulates — the tip is where it is *because* of every
 * bend before it, and that is the difference between a limb and an arc drawn
 * to look like one.
 */
export function spine(o: SpineOpts, t: number, phase: number): Point[] {
  const n = o.n ?? 16;
  const step = o.len / (n - 1);
  const pts: Point[] = [{ x: 0, y: 0 }];
  let x = 0;
  let y = 0;
  for (let i = 1; i < n; i++) {
    const u = i / (n - 1);
    const th =
      (o.curl ?? 0) * u +
      (o.sway ?? 0) * u * Math.sin(u * (o.waves ?? 1) * Math.PI + t * (o.speed ?? 1.5) + phase);
    x += Math.cos(th) * step;
    y += Math.sin(th) * step;
    pts.push({ x, y });
  }
  return pts;
}

/** The smallest half-width a stroked loop may have: below it the loop is a line. */
const HAIR = 0.022;

/**
 * A spine given a body: the outline of a stroke whose width follows `half`,
 * called with 0 at the root and 1 at the tip.
 *
 * Both sides are walked from the same normals, so a taper is one function and
 * not two edges that have to agree.
 */
export function ribbon(sp: Point[], half: (u: number) => number): Point[] {
  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = 0; i < sp.length; i++) {
    const p = sp[i] as Point;
    const q = sp[Math.min(i + 1, sp.length - 1)] as Point;
    const r = sp[Math.max(i - 1, 0)] as Point;
    const dx = q.x - r.x;
    const dy = q.y - r.y;
    const len = Math.hypot(dx, dy) || 1;
    const h = Math.max(half(i / (sp.length - 1)), HAIR);
    left.push({ x: p.x - (dy / len) * h, y: p.y + (dx / len) * h });
    right.push({ x: p.x + (dy / len) * h, y: p.y - (dx / len) * h });
  }
  return [...left, ...right.reverse()];
}

export interface DiscOpts {
  x: number;
  y: number;
  r: number;
  /** Squashed along the rim when it is not 1. */
  squash?: number;
  /** How much the rim of the disc itself wanders — a spore is not a circle. */
  wobble?: number;
  /** Turns the wobble and the squash together. */
  turn?: number;
  n?: number;
}

/** A blob small enough to be a part: a spore, a bud, a bubble, a node. */
export function disc(o: DiscOpts, t = 0, phase = 0): Point[] {
  const n = o.n ?? 18;
  const pts: Point[] = [];
  const turn = o.turn ?? 0;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const m = 1 + (o.wobble ?? 0) * Math.sin(3 * a + t * 0.9 + phase);
    const x = Math.cos(a) * o.r * m;
    const y = Math.sin(a) * o.r * m * (o.squash ?? 1);
    pts.push({
      x: o.x + x * Math.cos(turn) - y * Math.sin(turn),
      y: o.y + x * Math.sin(turn) + y * Math.cos(turn),
    });
  }
  return pts;
}

/**
 * A band cut out of a ring, from `a0` to `a1` radians about `(x, y)`.
 *
 * The one construction here that is not grown: a ring fragment is debris off
 * something that was made, and rounding its ends would make it a leaf.
 */
export function band(
  x: number,
  y: number,
  inner: number,
  outer: number,
  a0: number,
  a1: number,
  n = 12,
): Point[] {
  const out: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    out.push({ x: x + Math.cos(a) * outer, y: y + Math.sin(a) * outer });
  }
  for (let i = n; i >= 0; i--) {
    const a = a0 + ((a1 - a0) * i) / n;
    out.push({ x: x + Math.cos(a) * inner, y: y + Math.sin(a) * inner });
  }
  return out;
}

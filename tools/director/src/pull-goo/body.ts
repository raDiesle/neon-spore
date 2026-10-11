import type { Point } from "@neon-spore/content";
import { lumps } from "./noise.js";
import type { GooStyle } from "./style.js";

/**
 * **A body of GOO**: a closed contour with lumps that creep, pulled into a
 * teardrop the way it leans and flattened onto the ground when it lands, with
 * a neon glowing out of it rather than a white line round it (the owner on
 * OOZE: *the white border looks boring, maybe some neon is cool*). How it is
 * lit is the drop's material (`soft.ts`).
 */

export interface GooBody {
  readonly at: Point;
  readonly r: number;
  readonly seed: number;
  /** The way it leans, a unit vector, and how far it is drawn out that way. */
  readonly lean?: Point;
  readonly stretch?: number;
  /** Wider and lower than round above 1, taller below; squashed onto its own bottom. */
  readonly squash?: number;
  /** Lumps on top of the style's own, for a shudder. */
  readonly shake?: number;
  /** How sharp the drawn-out end is: 3 a rounded lean, 10 a falling drop's tail. */
  readonly point?: number;
  /** How far round its lumps have turned, in radians; `DROP_SPIN` a second when not given. */
  readonly spin?: number;
  /** Lobes standing out of the rim, `depth` of the radius: a drop in bloom. */
  readonly petals?: { readonly n: number; readonly depth: number };
}

/** Radians a second every GOO drop turns, whatever else it is doing — the owner, 10
 * October 2026, on SINK: *can we keep the rotating of the ball*, which BLOOM had. */
export const DROP_SPIN = 1;

/** The seed every GOO drop is drawn with, so the one under the hand and the one an
 * ending or a failure plays have the same lumps. */
export const DROP_SEED = 11;

/** The GOO drop at `at`, everything else as given. */
export const drop = (at: Point, r: number, rest: Partial<GooBody> = {}): GooBody => ({
  at,
  r,
  seed: DROP_SEED,
  ...rest,
});

/** Where the rim is at screen angle `a`, as an offset from `centre(b)`: the lumps, the
 * lean and the petals, squashed. A moulded arrow and a crater are laid onto this
 * (`soft-arrow.ts`, `soft-crater.ts`), so they follow the rim actually drawn, lumps and all. */
export function rimAt(b: GooBody, style: GooStyle, time: number, a: number): Point {
  const sq = b.squash ?? 1;
  const lean = b.lean ?? { x: 0, y: 0 };
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const turned = a - (b.spin ?? time * DROP_SPIN);
  const lump =
    style.lumpy * lumps(turned, time * style.creep, b.seed) +
    (b.shake ?? 0) * lumps(turned, time * 9, b.seed + 5);
  const toward = Math.max(0, ca * lean.x + sa * lean.y);
  const petal = b.petals ? b.petals.depth * (0.5 + 0.5 * Math.cos(b.petals.n * turned)) ** 2 : 0;
  const d = b.r * (1 + lump + petal) * (1 + (b.stretch ?? 0) * toward ** (b.point ?? 3));
  return { x: ca * d * sq, y: (sa * d) / sq };
}

/** The middle a squashed body is squashed about: sat on its own bottom. */
export function centre(b: GooBody): Point {
  return { x: b.at.x, y: b.at.y + b.r * (1 - 1 / (b.squash ?? 1)) };
}

/** The contour, smoothed through the midpoints of its samples so it has no corner. */
export function bodyPath(b: GooBody, style: GooStyle, time: number): Path2D {
  const n = 44;
  const c = centre(b);
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const o = rimAt(b, style, time, (i / n) * Math.PI * 2);
    pts.push({ x: c.x + o.x, y: c.y + o.y });
  }
  return smoothPath(pts);
}

/** A closed path through the midpoints of `pts`, each point a control, so it has no corner. */
export function smoothPath(pts: readonly Point[]): Path2D {
  const n = pts.length;
  const p = new Path2D();
  const mid = (i: number): Point => {
    const u = pts[i % n] as Point;
    const v = pts[(i + 1) % n] as Point;
    return { x: (u.x + v.x) / 2, y: (u.y + v.y) / 2 };
  };
  const m0 = mid(0);
  p.moveTo(m0.x, m0.y);
  for (let i = 1; i <= n; i++) {
    const c = pts[i % n] as Point;
    const m = mid(i);
    p.quadraticCurveTo(c.x, c.y, m.x, m.y);
  }
  p.closePath();
  return p;
}

/** The neon round a path: three soft passes added onto the field, widest faintest. */
export function glow(
  ctx: CanvasRenderingContext2D,
  p: Path2D,
  neon: string,
  r: number,
  strength = 1,
): void {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = neon;
  ctx.lineJoin = "round";
  for (const [w, a] of [
    [0.95, 0.07],
    [0.55, 0.11],
    [0.25, 0.2],
  ] as const) {
    ctx.lineWidth = r * w;
    ctx.globalAlpha = a * strength;
    ctx.stroke(p);
  }
  ctx.restore();
}

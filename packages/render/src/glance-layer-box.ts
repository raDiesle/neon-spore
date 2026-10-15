import { type GlanceFrame, glancedPoint, turnOf } from "./glance.js";

/**
 * **Where a glancing layer is cut** (`glance-layer.ts` lays the part down):
 * the rectangle the part is drawn within, and the screen box that rectangle
 * covers once the part is turned.
 */

interface Matrix {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

export const times = (p: Matrix, q: Matrix): Matrix => ({
  a: p.a * q.a + p.c * q.b,
  b: p.b * q.a + p.d * q.b,
  c: p.a * q.c + p.c * q.d,
  d: p.b * q.c + p.d * q.d,
  e: p.a * q.e + p.c * q.f + p.e,
  f: p.b * q.e + p.d * q.f + p.f,
});

export function inverse(m: Matrix): Matrix {
  const det = m.a * m.d - m.b * m.c;
  return {
    a: m.d / det,
    b: -m.b / det,
    c: -m.c / det,
    d: m.a / det,
    e: (m.c * m.f - m.d * m.e) / det,
    f: (m.b * m.e - m.a * m.f) / det,
  };
}

/** How far from the part's centre it is drawn, in pixels: either side, above, and below. */
export interface Reach {
  side: number;
  up: number;
  down: number;
}

/** The rectangle `reach` stands for on half `s`, as `rect` takes it. */
export const halfRect = ({ x, y }: GlanceFrame, s: -1 | 1, reach: Reach) =>
  [s < 0 ? x - reach.side : x, y - reach.up, reach.side, reach.up + reach.down] as const;

/**
 * The screen rectangle, whole pixels, that the part drawn within `reach` of its
 * centre covers **as turned** under `m`: its opened half stretched past
 * `reach`, its middle shifted, and the whole of it rolled. The layers are cut
 * to this and not to `reach`, or the opened half loses its outer edge — a
 * slick at the widest swing lost a sliver off its near side (the owner, 15
 * October 2026). The middle's ends are in it for a held part, whose middle
 * moves.
 */
export function screenBox(ctx: CanvasRenderingContext2D, m: Matrix, f: GlanceFrame, reach: Reach) {
  const xs: number[] = [];
  const ys: number[] = [];
  // Seen along a nod the rectangle is turned with it (`glance-layer.ts`'s `enterHalf`).
  const { angle } = turnOf(f);
  const c = Math.cos(angle);
  const sn = Math.sin(angle);
  for (const dx of [-reach.side, 0, reach.side]) {
    for (const dy of [-reach.up, reach.down]) {
      const at =
        angle === 0
          ? { x: f.x + dx, y: f.y + dy }
          : { x: f.x + dx * c - dy * sn, y: f.y + dx * sn + dy * c };
      const p = glancedPoint(f, at);
      xs.push(m.a * p.x + m.c * p.y + m.e);
      ys.push(m.b * p.x + m.d * p.y + m.f);
    }
  }
  const ox = Math.max(0, Math.floor(Math.min(...xs)));
  const oy = Math.max(0, Math.floor(Math.min(...ys)));
  // A canvas of no size bounds nothing: it draws nothing anyway, and a test's
  // stand-in reports one, which would leave the part not drawn at all.
  const ex = Math.ceil(Math.min(ctx.canvas?.width || Infinity, Math.max(...xs)));
  const ey = Math.ceil(Math.min(ctx.canvas?.height || Infinity, Math.max(...ys)));
  return { ox, oy, w: ex - ox, h: ey - oy };
}

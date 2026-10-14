/**
 * **A curve a thumb carries something along**: a polyline of equal pieces,
 * in thousandths of a tile, `len` long. THE LAMPREY's tow learnt it first
 * (`lamprey-tow.ts`) and THE BASTION's curved plates call it too
 * (`bastion-track.ts`), so the point along it and the point nearest a thumb
 * are worked out once.
 *
 * The pieces are taken as equal, so a point's way along is its piece and its
 * share of that piece — no square root, the way `purity.test.ts` wants a
 * table of integers rather than a sine.
 */

export interface CurvePoint {
  x: number;
  y: number;
}

/** The point `milli` along the curve. */
export function curveAt(pts: readonly CurvePoint[], len: number, milli: number): CurvePoint {
  const pieces = Math.max(1, pts.length - 1);
  const u = Math.trunc((Math.max(0, Math.min(len, milli)) * pieces * 1000) / Math.max(1, len));
  const i = Math.min(pieces - 1, Math.trunc(u / 1000));
  const f = u - i * 1000;
  const a = pts[i] ?? { x: 0, y: 0 };
  const b = pts[i + 1] ?? a;
  return {
    x: a.x + Math.trunc(((b.x - a.x) * f) / 1000),
    y: a.y + Math.trunc(((b.y - a.y) * f) / 1000),
  };
}

/**
 * The point of the curve nearest `(x, y)`: how far along it is, and the
 * square of how far off it the point lies. With `from` and `to`, only that
 * stretch of the curve is looked at, in thousandths along it.
 */
export function curveNearest(
  pts: readonly CurvePoint[],
  len: number,
  x: number,
  y: number,
  from = 0,
  to = len,
): { along: number; offSq: number } {
  const pieces = Math.max(1, pts.length - 1);
  const scale = Math.max(1, len);
  const lo = Math.trunc((Math.max(0, from) * pieces * 1000) / scale);
  const hi = Math.trunc((Math.min(len, to) * pieces * 1000) / scale);
  let best = lo;
  let near = Number.POSITIVE_INFINITY;
  for (let i = 0; i < pieces; i++) {
    if ((i + 1) * 1000 < lo || i * 1000 > hi) continue;
    const a = pts[i] ?? { x: 0, y: 0 };
    const b = pts[i + 1] ?? a;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const den = Math.max(1, dx * dx + dy * dy);
    const dot = (x - a.x) * dx + (y - a.y) * dy;
    const f0 = Math.max(0, lo - i * 1000);
    const f1 = Math.min(1000, hi - i * 1000);
    const f = Math.max(f0, Math.min(f1, Math.trunc((dot * 1000) / den)));
    const px = a.x + Math.trunc((dx * f) / 1000) - x;
    const py = a.y + Math.trunc((dy * f) / 1000) - y;
    const d = px * px + py * py;
    if (d < near) {
      near = d;
      best = i * 1000 + f;
    }
  }
  return { along: Math.trunc((best * len) / (pieces * 1000)), offSq: near };
}

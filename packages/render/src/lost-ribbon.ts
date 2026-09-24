/**
 * The shapes the blood out of the lost screen's wound is drawn from: a centre
 * line, and a ribbon of any width round one, smoothed so that twelve samples
 * do not show as facets.
 *
 * Out of `lost-bleed.ts` because that file is what the blood *does* — where it
 * gathers, when it splits, how far it runs — and this is only how a liquid's
 * outline is walked, which the pool and the runs both need.
 */

export interface Pt {
  readonly x: number;
  readonly y: number;
}

/** Twelve points along a quadratic from `a` through the pull of `b` to `c`. */
export function curve(a: Pt, b: Pt, c: Pt): Pt[] {
  const pts = [];
  for (let s = 0; s <= 11; s++) {
    const u = s / 11;
    const v = 1 - u;
    pts.push({
      x: v * v * a.x + 2 * v * u * b.x + u * u * c.x,
      y: v * v * a.y + 2 * v * u * b.y + u * u * c.y,
    });
  }
  return pts;
}

/**
 * One stream off the sheet's foot: it leaves from inside the foot, eases out
 * to its own side of it and then runs down, wandering a little, as a stream
 * finding its way down a plate does.
 */
export function stream(
  foot: Pt,
  side: number,
  half: number,
  len: number,
  r: number,
  salt: number,
): Pt[] {
  const pts = [];
  const top = foot.y - half * 1.6;
  for (let s = 0; s <= 11; s++) {
    const u = s / 11;
    const down = (len + half * 1.6) * u;
    const apart = side * (half * 0.45 + r * 0.2 * (1 - Math.exp(-down / (r * 0.7))));
    const wander = Math.sin(down / (r * 0.7) + salt * 1.3) * r * 0.05 * Math.min(1, down / r);
    pts.push({ x: foot.x + apart + wander, y: top + down });
  }
  return pts;
}

/**
 * A ribbon along `pts` at `half(u)` either side, into `path` — down its right
 * side and back up its left, which is clockwise on a canvas and the same way
 * `arc` winds, so every part of a run fills as one.
 */
export function ribbon(path: Path2D, pts: readonly Pt[], half: (u: number) => number): void {
  const right: Pt[] = [];
  const left: Pt[] = [];
  const last = pts.length - 1;
  for (const [s, q] of pts.entries()) {
    const a = pts[Math.max(0, s - 1)] as Pt;
    const b = pts[Math.min(last, s + 1)] as Pt;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = (b.y - a.y) / len;
    const ny = -(b.x - a.x) / len;
    const h = half(s / last);
    right.push({ x: q.x + nx * h, y: q.y + ny * h });
    left.push({ x: q.x - nx * h, y: q.y - ny * h });
  }
  smooth(path, right, true);
  smooth(path, left.reverse(), false);
  path.closePath();
}

/** A smooth line through `pts`, each point pulling the curve through the
 * midpoints either side of it, so twelve samples do not show as facets. */
export function smooth(path: Path2D, pts: readonly Pt[], start: boolean): void {
  const first = pts[0] as Pt;
  if (start) path.moveTo(first.x, first.y);
  else path.lineTo(first.x, first.y);
  for (let s = 1; s < pts.length - 1; s++) {
    const q = pts[s] as Pt;
    const n = pts[s + 1] as Pt;
    path.quadraticCurveTo(q.x, q.y, (q.x + n.x) / 2, (q.y + n.y) / 2);
  }
  const end = pts[pts.length - 1] as Pt;
  path.lineTo(end.x, end.y);
}

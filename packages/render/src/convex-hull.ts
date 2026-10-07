import type { Point } from "./instar-place.js";

/**
 * The convex hull of `pts`, round from the leftmost (Andrew's monotone chain):
 * the outline round a solid that has been sampled as points and seen, such as
 * THE INSTAR's head turned to the ship (`instar-quarter-model.ts`).
 */
export function convexHull(pts: readonly Point[]): Point[] {
  const s = [...pts].sort((a, b) => a.x - b.x || a.y - b.y);
  if (s.length < 3) return s;
  const cross = (o: Point, a: Point, b: Point) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: Point[] = [];
  for (const p of s) {
    while (lower.length >= 2 && cross(lower.at(-2) as Point, lower.at(-1) as Point, p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper: Point[] = [];
  for (let i = s.length - 1; i >= 0; i--) {
    const p = s[i] as Point;
    while (upper.length >= 2 && cross(upper.at(-2) as Point, upper.at(-1) as Point, p) <= 0)
      upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

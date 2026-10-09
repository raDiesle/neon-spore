import type { Point } from "./lamprey-shape.js";

/**
 * **THE LAMPREY settling onto a tile it crawled to** (the owner, 9 October
 * 2026: *fluent movement where it was before and where it stops*): the body
 * swung off the crawl's trail onto the way its tail lies, at its full
 * length. Cut out of `lamprey-shape.ts`, which it took past 250 lines; the
 * pose decides when and which way (`lamprey-pose.ts`, `crawledTo`).
 */

/**
 * Settling: the spine `k` of the way from `a` to `b`, each piece turned from
 * its angle in one toward its angle in the other and laid end to end from the
 * neck — so the body swings round the mouth at its full length, where
 * carrying each point straight across would fold it short. **Every piece
 * turns the way the whole body does** (`whole`), so a piece near half a turn
 * never flips side from one frame to the next.
 */
export function swung(a: readonly Point[], b: readonly Point[], k: number, whole: number): Point[] {
  const a0 = a[0] ?? { x: 0, y: 0 };
  const b0 = b[0] ?? a0;
  let x = a0.x + (b0.x - a0.x) * k;
  let y = a0.y + (b0.y - a0.y) * k;
  const out: Point[] = [{ x, y }];
  for (let i = 1; i < a.length; i++) {
    const [pa, qa] = [a[i - 1] ?? a0, a[i] ?? a0];
    const [pb, qb] = [b[i - 1] ?? b0, b[i] ?? b0];
    const from = Math.atan2(qa.y - pa.y, qa.x - pa.x);
    const turn = whole + wrap(heading(pa, qa, pb, qb) - whole);
    const len =
      Math.hypot(qa.x - pa.x, qa.y - pa.y) * (1 - k) + Math.hypot(qb.x - pb.x, qb.y - pb.y) * k;
    x += Math.cos(from + turn * k) * len;
    y += Math.sin(from + turn * k) * len;
    out.push({ x, y });
  }
  return out;
}

/** How far the way from `pb` to `qb` is turned from the way from `pa` to `qa`, radians. */
function heading(pa: Point, qa: Point, pb: Point, qb: Point): number {
  return Math.atan2(qb.y - pb.y, qb.x - pb.x) - Math.atan2(qa.y - pa.y, qa.x - pa.x);
}

/** An angle brought into a half turn either way. */
export const wrap = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));

import { splineSealed } from "./spline.js";

/**
 * Where a body's edge is: the two banks of a tapered ribbon along a run of
 * joints, and the contour they close into.
 *
 * Split off `snake-skin.ts` on 20 September 2026, when the contour stopped
 * being a polygon. The seam is between *where the edge runs* — here — and
 * *what the thing inside it is made of*, which is the light, the scales and
 * the rim next door. The venom stream borrows this file and none of that one
 * (`snake-shot.ts`), which is the argument for the split in one line.
 *
 * **It is a spline, not a chain of straight lines.** A body's joints are a
 * whole tile apart and a round opens with three of them, so a ribbon traced
 * with `lineTo` was a six-sided polygon with a visible kink at every joint —
 * an outline of a snake rather than a snake. The same points run through
 * `splineSealed` are a grown contour that rounds its own corners, which is
 * what every other closed shape in this game is made of (`spline.ts`).
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Both sides of a tapered ribbon along `joints`, `halfAt(i)` wide at each one.
 *
 * Pulled out of the drawing because the lit ribbon is the same contour at a
 * smaller width — two copies of this loop would be two chances for the
 * highlight to stop following the body it is meant to be lying on.
 */
export function ribbonSides(
  joints: Point[],
  halfAt: (i: number) => number,
): { left: Point[]; right: Point[] } {
  const left: Point[] = [];
  const right: Point[] = [];
  for (const [i, p] of joints.entries()) {
    const prev = joints[i - 1] ?? p;
    const next = joints[i + 1] ?? p;
    // The normal of the direction the body runs in here, which for a corner is
    // the average of the two sides — that is what rounds a turn off.
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -(dy / len) * halfAt(i);
    const ny = (dx / len) * halfAt(i);
    left.push({ x: p.x + nx, y: p.y + ny });
    right.push({ x: p.x - nx, y: p.y - ny });
  }
  return { left, right };
}

/**
 * How far past the last joint the tail is carried, in its own half-widths.
 * Enough that the end reads as drawn to a point rather than as a segment that
 * stopped on the tile it was standing on.
 */
const TIP_REACH = 3.2;

/**
 * The contour those two banks close into: up one side, out to a tip past the
 * last joint, back down the other, and cut square across the end it started
 * at — which on a body is the neck the head sits over and on the venom stream
 * is the snout it is still coming out of.
 *
 * **Both banks in full.** Until 20 September 2026 the left one ran to its last
 * point and the right one stopped one short, so every tail in the round came
 * to a lopsided notch instead of a point — the one thing in this picture that
 * was wrong rather than merely plain.
 */
export function ribbonPath(joints: Point[], sides: { left: Point[]; right: Point[] }): Path2D {
  const outline = ribbonOutline(joints, sides);
  return outline.length === 0 ? new Path2D() : splineSealed(outline);
}

/** Up the left bank, round the tip, back down the right: the contour's points
 * in order, before anybody decides whether to close them. */
function ribbonOutline(joints: Point[], sides: { left: Point[]; right: Point[] }): Point[] {
  const { left, right } = sides;
  const end = joints.at(-1);
  const before = joints.at(-2);
  const lastL = left.at(-1);
  const lastR = right.at(-1);
  if (!end || !before || !lastL || !lastR) return [];
  const dx = end.x - before.x;
  const dy = end.y - before.y;
  const len = Math.hypot(dx, dy) || 1;
  const half = Math.hypot(lastL.x - lastR.x, lastL.y - lastR.y) / 2;
  const tip = {
    x: end.x + (dx / len) * half * TIP_REACH,
    y: end.y + (dy / len) * half * TIP_REACH,
  };
  return [...left, tip, ...[...right].reverse()];
}

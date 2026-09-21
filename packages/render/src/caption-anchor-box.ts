import type { AnchorPoint } from "./caption-anchor.js";

/**
 * **The ring round a boss's fixture** — the two shapes every line of
 * `caption-anchor-boss*.ts` answers with, in one place.
 *
 * It was three copies, one per file, and they were copies rather than three
 * decisions: the same `CLEAR`, the same six pixels of air, the same loop over
 * a set of points. The third file made it worth a file of its own
 * (`docs/queue.md`, the sweep of 21 September 2026) — a boss added to any of
 * the three asks here for its ring and cannot quietly get a different one.
 */

/** How far the caption's box stands off the fixture it is about. */
export const CLEAR = 16;

/** A fixture's extent, before the air round it. */
export interface Box {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

/** A ring round one box, with the air every boss's ring takes. */
export function box(b: Box): AnchorPoint {
  return { x: b.x, y: b.y, r: b.ry + 6, rx: b.rx + 6, clear: CLEAR };
}

/** A box round a set of points, each with radius `r`; null with no points. */
export function around(points: readonly { x: number; y: number }[], r: number): AnchorPoint | null {
  if (points.length === 0) return null;
  let left = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  for (const p of points) {
    left = Math.min(left, p.x - r);
    right = Math.max(right, p.x + r);
    top = Math.min(top, p.y - r);
    bottom = Math.max(bottom, p.y + r);
  }
  return box({
    x: (left + right) * 0.5,
    y: (top + bottom) * 0.5,
    rx: (right - left) * 0.5,
    ry: (bottom - top) * 0.5,
  });
}

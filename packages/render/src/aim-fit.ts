import type { Point } from "./outline-drift.js";

/**
 * **A shot's aim fitted round a part as it is drawn**: the middle of the
 * points' box, and the farthest of them from it. The owner, 9 October 2026,
 * of EMBER on THE GORGE: *the crosshair on screen must be around the graphic
 * of the thing to hit - wider is better if unclear*. A reading passes the
 * outline of the part at its biggest, posed the way the canvas poses it, and
 * the ring (`aim-ember.ts`) stands outside every point of it.
 */
export function aimRound(points: readonly Point[]): { x: number; y: number; r: number } {
  let x0 = Number.POSITIVE_INFINITY;
  let y0 = Number.POSITIVE_INFINITY;
  let x1 = Number.NEGATIVE_INFINITY;
  let y1 = Number.NEGATIVE_INFINITY;
  for (const p of points) {
    x0 = Math.min(x0, p.x);
    y0 = Math.min(y0, p.y);
    x1 = Math.max(x1, p.x);
    y1 = Math.max(y1, p.y);
  }
  const x = (x0 + x1) / 2;
  const y = (y0 + y1) / 2;
  let r = 0;
  for (const p of points) r = Math.max(r, Math.hypot(p.x - x, p.y - y));
  return { x, y, r };
}

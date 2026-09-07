import { perimeter, resample } from "./metaball.js";
import type { Point } from "./shapes.js";

/**
 * **Spreading a fixed number of points across a subject that may be in
 * pieces**, which is the shape sheet's need and not the game's.
 *
 * Cut off `metaball.ts` on that file's line count, and the seam is the honest
 * one: next door is the trace itself — the field, the grid, the rings — which
 * the field and the sheet both draw from. This is a thing only a *comparison*
 * wants, and only the sheet compares: the travel metric and an onion-skinned
 * frame both index a contour by position and compare t against t = 0 point by
 * point, so a count that changed when a shape parted would make that
 * comparison meaningless exactly when the shape got interesting. Nothing in
 * `packages/render` has ever asked, because the game draws one frame.
 */
/**
 * Spread `n` points across several loops by length, so a subject that comes
 * apart still samples to the same number of points it did while it was one
 * body. Anything that indexes a contour by position — the travel metric, an
 * onion-skinned frame — compares t against t = 0 point by point, and a count
 * that changes when a shape parts would make that comparison meaningless
 * exactly when the shape got interesting.
 */
export function resampleAll(loops: Point[][], n: number, min = 10): Point[][] {
  if (loops.length === 0) return loops;
  const lengths = loops.map(perimeter);
  const total = lengths.reduce((a, b) => a + b, 0) || 1;
  const counts = lengths.map((l) => Math.max(min, Math.floor((l / total) * n)));
  const spare = n - counts.reduce((a, b) => a + b, 0);
  // The remainder goes to the biggest loop, which is the one it shows on.
  let biggest = 0;
  for (let i = 1; i < lengths.length; i++) if (lengths[i]! > lengths[biggest]!) biggest = i;
  counts[biggest] = Math.max(min, counts[biggest]! + spare);
  return loops.map((loop, i) => resample(loop, counts[i]!));
}

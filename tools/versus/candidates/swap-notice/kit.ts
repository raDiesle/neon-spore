import type { SurfaceY } from "../../../../packages/render/src/hull-frame.js";
import type { Layout } from "../../../../packages/render/src/layout.js";

/**
 * What every `swap:notice` candidate draws on: the hull's rim as a path, and
 * the beat's flash. Kept beside the candidates, so it goes with the slot.
 */

/** The hull's skin from `from` to `to` of its width (0..1), as a stroke. */
export function hullRim(l: Layout, surfaceY: SurfaceY, from = 0, to = 1): Path2D {
  const path = new Path2D();
  const x0 = l.gridLeft + l.gridWidth * from;
  const x1 = l.gridLeft + l.gridWidth * to;
  const step = l.tile / 6;
  let first = true;
  for (let x = x0; x <= x1 + 0.5; x += step) {
    const at = Math.min(x, x1);
    if (first) path.moveTo(at, surfaceY(at));
    else path.lineTo(at, surfaceY(at));
    first = false;
  }
  return path;
}

/** 1 on the beat's edge, falling away across it. */
export function beatFlash(beatPhase: number): number {
  return (1 - beatPhase) ** 2;
}

import { catmullRomToBezierPath, type Point } from "@neon-spore/content";
import type { EggBeats } from "./egg-curve.js";

/**
 * The cloaca's own shape, for one frame — split out of `cannon-maw.ts` so that
 * file's `LAY_LOOK.draw` stays a draw call rather than also carrying the
 * geometry it draws.
 *
 * **Direction, in the numbers rather than in the prose.** `PEAR` makes the
 * contour fatter downward — towards the ship — and narrower at the vent, so
 * the swelling has a direction rather than growing evenly like a balloon.
 * `MOUTH_LOOK.drop` (`muzzle.ts`) moves the mouth's own centre a further
 * seventh of a tile towards the ship before any of this is drawn at all, and
 * both halves point the same way on purpose.
 */

/** How much fatter the contour is towards the ship than at the vent. */
const PEAR = 0.34;
/** Half width and half height at rest, in tiles. */
const REST_RX = 0.27;
export const REST_RY = 0.23;
/** Points round the contour. Enough that a lobe is a lobe and not a corner. */
const STEPS = 34;

/** The cloaca's outline for one frame, as a closed path. */
export function eggContour(cx: number, cy: number, tile: number, t: number, b: EggBeats): Path2D {
  const rx = tile * REST_RX;
  const ry = tile * REST_RY;
  const pts: Point[] = [];
  for (let i = 0; i < STEPS; i++) {
    const a = (i / STEPS) * Math.PI * 2;
    // `sin(a)` is positive downward on a canvas, which is towards the ship.
    const down = Math.sin(a);
    // The vent is straight up: how far this angle is from it, wrapped.
    const off = Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2));
    // The contour stretched *around* the egg rather than merely opened for it
    // — a bump on the upward flank, widest while the egg is in the vent.
    const neck = b.vent * 0.34 * Math.exp(-((off / 0.6) ** 2));
    const mul =
      1 +
      PEAR * down +
      b.bulge * 0.44 * (0.58 + 0.42 * down) +
      neck +
      b.tremor * 0.05 * Math.sin(a * 3) +
      0.03 * Math.sin(a * 3 + t * 1.1);
    pts.push({ x: cx + Math.cos(a) * rx * mul, y: cy + down * ry * mul });
  }
  return new Path2D(catmullRomToBezierPath(pts));
}

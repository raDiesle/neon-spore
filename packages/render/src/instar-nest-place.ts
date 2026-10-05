import { SPOTS, SPOTS_NEST } from "./instar-egg-spots.js";
import { instarAt, type Point } from "./instar-place.js";
import type { Look } from "./instar-plate.js";
import type { Layout } from "./layout.js";

/**
 * **Where THE INSTAR's two nests sit, and the slime under each**: what both
 * nest drawings place (`instar-eggs.ts` `drawnNests`, `instar-nest-baked.ts`
 * `drawBakedNests`), and what a bolt meets of them (`instar-limb-stop.ts`).
 * The slime is the lowest thing a nest draws, an ellipse pooled under it.
 */

/** One nest this frame: its point, how many eggs it holds, their spots and the seed that jostles them. */
export interface NestAt {
  at: Point;
  n: number;
  spots: readonly (readonly [number, number])[];
  seed: number;
}

/** The squashed nest, one egg per tap its mark needs, then the clutch — each as full as the figure has it. */
export function nestsAt(l: Layout, look: Look): NestAt[] {
  const { f } = look;
  return [
    {
      at: instarAt(l, f.nestX, f.nestY),
      n: Math.round(f.nest * SPOTS_NEST.length),
      spots: SPOTS_NEST,
      seed: 3,
    },
    {
      at: instarAt(l, f.eggsX, f.eggsY),
      n: Math.round(f.eggs * SPOTS.length),
      spots: SPOTS,
      seed: 7,
    },
  ];
}

/** The slime a nest at `at` sits in: its middle and its two radii, in pixels. */
export function nestPool(at: Point, r: number): { x: number; y: number; rx: number; ry: number } {
  return { x: at.x, y: at.y + r * 0.06, rx: r * 0.62, ry: r * 0.09 };
}

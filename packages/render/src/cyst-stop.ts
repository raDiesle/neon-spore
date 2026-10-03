import { cystVerdict, midCol, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, type Foot, lowestFoot, outlineFoot, roundFoot } from "./core-stop.js";
import { CYST_CORE_FLAT, type CystPose, cystCoreR, cystLobes, type Point } from "./cyst-shape.js";
import type { Layout } from "./layout.js";

/**
 * Where the sac stands this frame: its middle on screen, its pose, the
 * core's size, and the bud as drawn about the middle, if one hangs.
 */
export interface CystStand {
  x: number;
  y: number;
  pose: CystPose;
  core: number;
  bud: (Point & { r: number; ry: number }) | null;
}

/**
 * **Where a bolt meets THE CYST**, for `BoltStops` (`bolt-stop.ts`): the
 * core, bared on a fire step, at its lower rim; the bud on its own step, up
 * the column it swells over, at its lower rim; and otherwise the lowest of
 * the sac and the bud.
 *
 * The core sits in the sac's middle, and a bolt up the middle column to it is
 * drawn up through the lower lobe. That is a look, and it is not fixed here.
 * The bud's stalk, never lower than the lobe beside it, is left out.
 */
export function cystStopper(l: Layout, world: World, at: CystStand): Stopper {
  const feet: Foot[] = [
    outlineFoot(
      cystLobes(l, at.pose).flatMap((b) => b.points),
      at.x,
      at.y,
    ),
  ];
  // A bud not yet out is judged where the simulation judges it, at row 0.
  let budY = l.gridTop;
  if (at.bud !== null) {
    feet.push(roundFoot(at.x + at.bud.x, at.y + at.bud.y, at.bud.r, at.bud.ry));
    budY = at.y + at.bud.y + at.bud.ry;
  }
  const coreY = at.y + cystCoreR(l) * at.core * CYST_CORE_FLAT;
  const mid = midCol(world.cfg);
  return coreStopper(world, cystVerdict, (col) => (col === mid ? coreY : budY), lowestFoot(feet));
}

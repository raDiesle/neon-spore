import type { Point } from "@neon-spore/content";
import { halterVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, lowestFoot, outlineFoot } from "./core-stop.js";
import type { HalterSegment } from "./halter-pose.js";
import { halterCoreAt, halterCoreR, halterLowerPoints } from "./halter-shape.js";
import type { Layout } from "./layout.js";

/** One segment's lower plate as drawn: dropped `dy` and shaken `dx` off its place. */
export interface HalterJaw {
  k: HalterSegment;
  dx: number;
  dy: number;
}

/**
 * **Where a bolt meets THE HALTER**, for `BoltStops` (`bolt-stop.ts`): the
 * core in the middle segment, open on a fire step, at its near rim, and
 * otherwise the lower plates' teeth — each where its segment has dropped it,
 * the slab scaled `sx`, `sy` about `at` as it tips over spent.
 *
 * The core sits in the middle segment's mouth, between its plates, so a bolt
 * up the middle column to it is drawn up through the lower plate's teeth.
 * That is a look, and it is not fixed here.
 */
export function halterStopper(
  l: Layout,
  world: World,
  size: number,
  at: Point,
  scale: { sx: number; sy: number },
  jaws: readonly HalterJaw[],
): Stopper {
  const feet = jaws.map((j) =>
    outlineFoot(
      halterLowerPoints(l, j.k).map((p) => ({
        x: (p.x + j.dx) * scale.sx,
        y: (p.y + j.dy) * scale.sy,
      })),
      at.x,
      at.y,
    ),
  );
  const core = at.y + (halterCoreAt(l).y + halterCoreR(l) * size) * scale.sy;
  return coreStopper(world, halterVerdict, core, lowestFoot(feet));
}

import type { Point } from "@neon-spore/content";
import { grindstoneVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, outlineFoot } from "./core-stop.js";
import { grindstoneAxleR } from "./grindstone-shape.js";
import type { Layout } from "./layout.js";

/**
 * **Where a bolt meets THE GRINDSTONE**, for `BoltStops` (`bolt-stop.ts`):
 * the axle, locked on a fire step, at its near rim, and otherwise the
 * wheel's edge — its flats where the pair have ground it, squashed edge-on
 * as it falls free, about `at`.
 *
 * The wheel stands face-on with the axle through its middle, so a bolt up
 * the middle column to a lit axle crosses the face on its way. The caliper
 * hangs over the wheel's top and never below it, so it is not asked.
 */
export function grindstoneStopper(
  l: Layout,
  world: World,
  size: number,
  at: Point,
  squash: number,
  wheel: readonly Point[],
): Stopper {
  const edge = wheel.map((p) => ({ x: p.x * squash, y: p.y }));
  const axle = at.y + grindstoneAxleR(l) * size;
  return coreStopper(world, grindstoneVerdict, axle, outlineFoot(edge, at.x, at.y));
}

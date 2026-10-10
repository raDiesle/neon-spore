import { type LampreyState, lampreyVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper } from "./core-stop.js";
import { type LampreyPose, lampreyGulletReach } from "./lamprey-shape.js";

/**
 * **Where a bolt meets THE LAMPREY**, for `BoltStops` (`bolt-stop.ts`): the
 * lit gullet's near rim while it rears, up its tile's column, where the
 * simulation takes the hit a moment later (`sim/lamprey-shot.ts`). Nothing
 * else of the eel stops a bolt, as nothing else of it is met.
 */
export function lampreyStopper(world: World, s: LampreyState, p: LampreyPose): Stopper {
  const rim = p.y + p.r * lampreyGulletReach(s.hits) * p.tilt;
  return coreStopper(world, lampreyVerdict, rim, () => null);
}

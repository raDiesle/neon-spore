import { type LampreyState, lampreyVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper } from "./core-stop.js";
import { type LampreyPose, lampreyGulletReach } from "./lamprey-shape.js";

/**
 * **Where a bolt meets THE LAMPREY**, for `BoltStops` (`bolt-stop.ts`): the
 * lit gullet's near rim while it rears, up its tile's column, where the
 * simulation takes the hit a moment later (`sim/lamprey-shot.ts`); and the
 * sucker's lower rim, as armour, up the head's column in any other phase it
 * stands on the field. Nothing else of the eel stops a bolt, as nothing else
 * of it is met.
 */
export function lampreyStopper(world: World, s: LampreyState, p: LampreyPose): Stopper {
  const rim = p.y + p.r * lampreyGulletReach(s.hits) * p.tilt;
  const sucker = p.y + p.r * p.tilt;
  const met = coreStopper(world, lampreyVerdict, rim, () => sucker);
  return (col, x, color) =>
    lampreyVerdict(world, col, color) === null ? null : met(col, x, color);
}

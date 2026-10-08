import {
  type BastionState,
  bastionFrontGun,
  bastionGunAngle,
  bastionLitStep,
  bastionPieceCount,
  bastionVerdict,
  midCol,
  type World,
} from "@neon-spore/sim";
import type { BastionPose } from "./bastion-pose.js";
import { bastionGunAt, bastionPortAt, bastionReach } from "./bastion-shape.js";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, roundFoot } from "./core-stop.js";
import type { Layout } from "./layout.js";

/**
 * **Where a bolt meets THE BASTION**, for `BoltStops` (`bolt-stop.ts`): the
 * moon's lower edge across every column it covers, as wide as the shell on
 * it now; and, on a shell a shot is asked of, the gun turned to the front or
 * the open port — the bolt drawn past the edge and up to it, since the gun
 * stands out of the moon's near face and the port is a way down into it.
 * Asked by the moon's own verdict (`sim/bastion-shot.ts`), so the picture
 * and the judgment never disagree on what a bolt hit.
 */
export function bastionStopper(l: Layout, world: World, s: BastionState, p: BastionPose): Stopper {
  const c = p.c;
  const k = p.near < 1 ? 0.12 + 0.88 * p.near : 1;
  const foot = roundFoot(c.x, c.y, bastionReach(l, s) * k);
  const mid = midCol(world.cfg);
  const core = (col: number): number => {
    const step = bastionLitStep(s);
    if (step?.layer === "ring") {
      const front = bastionFrontGun(world, s);
      return bastionGunAt(l, c, bastionGunAngle(s, front, bastionPieceCount(step))).y;
    }
    return bastionPortAt(l, world.cfg, c, col - mid).y;
  };
  return coreStopper(world, bastionVerdict, core, foot);
}

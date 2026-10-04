import { type CurtainState, curtainCoreBare, curtainVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, type Foot, outlineFoot, roundFoot } from "./core-stop.js";
import { curtainCorePoints, curtainCoreRadius } from "./curtain-sheet.js";
import { type Layout, tileCX, tileCY } from "./layout.js";

/**
 * **Where a bolt meets THE CURTAIN**, for `BoltStops` (`bolt-stop.ts`): the
 * core in its own column, at its lower edge — bare in its colour a `target`,
 * in the other `wrong`, covered its armour (`curtainVerdict`) — `shake` off
 * where it hangs, as the blow of a hit shakes it.
 *
 * The fabric is a creature on the field, which stops a bolt in the
 * simulation where it meets it, so it is not met here.
 */
export function curtainStopper(
  l: Layout,
  world: World,
  c: CurtainState,
  time: number,
  shake: number,
): Stopper {
  const x = tileCX(l, c.coreCol) + shake;
  const y = tileCY(l, world.cfg.curtainRow);
  const bare = curtainCoreBare(world, c);
  const r = curtainCoreRadius(l, bare, c.phase === "torn", time);
  const foot: Foot = bare ? outlineFoot(curtainCorePoints(x, y, r, time)) : roundFoot(x, y, r);
  return coreStopper(world, curtainVerdict, foot(x) ?? y + r, foot);
}

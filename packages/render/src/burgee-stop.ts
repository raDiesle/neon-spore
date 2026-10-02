import { type BurgeeState, burgeeVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { burgeePivot, burgeeSpindleAt, burgeeSpindlePoints, type Point } from "./burgee-shape.js";
import { coreHurt } from "./core-hurt.js";
import { coreStopper, lowestFoot, outlineFoot, rodFoot } from "./core-stop.js";
import type { Layout } from "./layout.js";
import { STROKE } from "./palette.js";

/**
 * **Where a bolt meets THE BURGEE**, for `BoltStops` (`bolt-stop.ts`): the
 * spindle, lit on a fire step, at its foot over the middle column, and
 * otherwise whatever of the fixture hangs lowest over x — the spindle, the
 * boom or the flag on the end of it, all laid `off` the way the drawer has
 * moved them, shaken or still swinging in.
 *
 * The flag hangs *below* the spindle, and swings through the middle column
 * on its way across: a bolt the simulation says reached the spindle is drawn
 * reaching it, up through the flag when the flag is there. That is a look,
 * and it is not fixed here.
 */
export function burgeeStopper(
  l: Layout,
  world: World,
  s: BurgeeState,
  time: number,
  tip: Point,
  flag: readonly Point[],
  off: Point,
): Stopper {
  const at = burgeeSpindleAt(l, world.cfg);
  const spindlePts = burgeeSpindlePoints(l, time, coreHurt(s.hits).size);
  const spindle = outlineFoot(spindlePts, at.x + off.x, at.y + off.y);
  const core = spindle(at.x + off.x) ?? at.y + off.y;
  const pivot = burgeePivot(l, world.cfg);
  const boom = rodFoot(
    { x: pivot.x + off.x, y: pivot.y + off.y },
    { x: tip.x + off.x, y: tip.y + off.y },
    STROKE.outline * 1.3,
  );
  const feet = [spindle, boom, outlineFoot(flag, off.x, off.y)];
  return coreStopper(world, burgeeVerdict, core, lowestFoot(feet));
}

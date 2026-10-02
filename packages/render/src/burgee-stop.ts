import { type BurgeeState, burgeeVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { burgeePivot, burgeeSpindleAt, burgeeSpindlePoints, type Point } from "./burgee-shape.js";
import { coreHurt } from "./core-hurt.js";
import { coreStopper, lowestFoot, outlineFoot } from "./core-stop.js";
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
  const feet = [
    spindle,
    boomFoot(burgeePivot(l, world.cfg), tip, off),
    outlineFoot(flag, off.x, off.y),
  ];
  return coreStopper(world, burgeeVerdict, core, lowestFoot(feet));
}

/** The boom as the rod it is stroked as, pivot to tip. */
function boomFoot(pivot: Point, tip: Point, off: Point) {
  const len = Math.hypot(tip.x - pivot.x, tip.y - pivot.y) || 1;
  const w = STROKE.outline * 1.3;
  const nx = (-(tip.y - pivot.y) / len) * w;
  const ny = ((tip.x - pivot.x) / len) * w;
  const rod = [
    { x: pivot.x + nx, y: pivot.y + ny },
    { x: tip.x + nx, y: tip.y + ny },
    { x: tip.x - nx, y: tip.y - ny },
    { x: pivot.x - nx, y: pivot.y - ny },
  ];
  return outlineFoot(rod, off.x, off.y);
}

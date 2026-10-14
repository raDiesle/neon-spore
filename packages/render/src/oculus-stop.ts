import { midCol, oculusVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, roundFoot } from "./core-stop.js";
import type { Circle, Layout } from "./layout.js";
import { oculusGlanceSqueeze } from "./oculus-glance.js";
import { oculusRadius } from "./oculus-shape.js";

/**
 * **Where a bolt meets THE OCULUS**, for `BoltStops` (`bolt-stop.ts`): the
 * core, open on a fire step, at its lower rim, and otherwise the lens's rim.
 * `at` is the lens's middle on screen and `core` the core as drawn about it.
 *
 * The core sits in the socket behind the leaves, and a bolt up the middle
 * column to it is drawn up through the rim and the lower leaves. A look step
 * asks for a column two off the middle, past the rim, where nothing is drawn
 * to meet: the bolt there is judged at row 0 and stops there. Both are looks,
 * and neither is fixed here.
 *
 * Turned (`oculus-glance.ts`), each half of the rim is met as far out as the
 * turn draws it.
 */
export function oculusStopper(
  l: Layout,
  world: World,
  at: { x: number; y: number },
  core: Circle,
  time: number,
): Stopper {
  const coreY = at.y + core.y + core.r;
  const mid = midCol(world.cfg);
  return coreStopper(
    world,
    oculusVerdict,
    (col) => (col === mid ? coreY : l.gridTop),
    (x) => {
      const rim = oculusRadius(l).rim;
      const k = oculusGlanceSqueeze(l, time, x < at.x ? -1 : 1);
      return roundFoot(at.x, at.y, rim * k, rim)(x);
    },
  );
}

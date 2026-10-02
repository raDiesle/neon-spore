import { davitVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, lowestFoot, outlineFoot, roundFoot } from "./core-stop.js";
import {
  DAVIT_SAG,
  davitBoomPoints,
  davitHook,
  davitHookRadius,
  davitMast,
  davitSocket,
} from "./davit-shape.js";
import type { Layout } from "./layout.js";

/**
 * **Where a bolt meets THE DAVIT**, for `BoltStops` (`bolt-stop.ts`): the
 * hook, lit on a fire step, at its near rim, and otherwise the lowest of the
 * hook, the boom swung to `angle` and stood to `stand`, and the mast's socket.
 *
 * The hook hangs over the socket, and a bolt up the middle column to it is
 * drawn up through the socket. That is a look, and it is not fixed here. A
 * fire step finds the boom swinging back from a steer, a few degrees off at
 * most, so the hook it lights still hangs in the middle column.
 */
export function davitStopper(l: Layout, world: World, angle: number, stand: number): Stopper {
  const mast = davitMast(l, world.cfg);
  const hook = davitHook(l, angle, DAVIT_SAG);
  const r = davitHookRadius(l);
  const socket = davitSocket(l);
  const feet = [
    roundFoot(mast.x + hook.x, mast.y + hook.y, r),
    outlineFoot(davitBoomPoints(l, angle, stand), mast.x, mast.y),
    roundFoot(mast.x, mast.y + socket.y, socket.rx, socket.ry),
  ];
  return coreStopper(world, davitVerdict, mast.y + hook.y + r, lowestFoot(feet));
}

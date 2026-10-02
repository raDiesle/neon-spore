import { type GovernorState, governorVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreHurt } from "./core-hurt.js";
import { coreStopper, roundFoot } from "./core-stop.js";
import { type Dial, hubR, rimDepth } from "./governor-shape.js";
import type { Layout } from "./layout.js";

/**
 * **Where a bolt meets THE GOVERNOR**, for `BoltStops` (`bolt-stop.ts`): the
 * hub, lit on a fire step, and otherwise the flywheel's near edge — the
 * brass rim showing under the face, which is the lowest of it over any x.
 *
 * The wheel lies flat and its face is turned up to the eye, so a bolt up the
 * middle column to a lit hub crosses the face on its way and stops on the
 * hub's near rim.
 */
export function governorStopper(l: Layout, world: World, s: GovernorState, d: Dial): Stopper {
  const r = hubR(l) * coreHurt(s.hits).size;
  const hub = d.cy + r * (0.5 + 0.5 * d.tilt);
  const wheel = roundFoot(d.cx, d.cy + rimDepth(l, d), d.r, d.r * d.tilt);
  return coreStopper(world, governorVerdict, hub, wheel);
}

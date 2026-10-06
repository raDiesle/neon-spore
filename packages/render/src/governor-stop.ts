import {
  type GovernorState,
  governorFlownTicks,
  governorVerdict,
  type World,
} from "@neon-spore/sim";
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
 *
 * **A bolt is asked about by when it left the cannon**: the hub takes only a
 * bolt fired with the needle pointing down (`sim/governor-shot.ts`), so the
 * verdict is asked with the ticks this bolt has already flown — the needle
 * then, not the needle now less a whole flight.
 */
export function governorStopper(l: Layout, world: World, s: GovernorState, d: Dial): Stopper {
  const r = hubR(l) * coreHurt(s.hits).size;
  const hub = d.cy + r * (0.5 + 0.5 * d.tilt);
  const wheel = roundFoot(d.cx, d.cy + rimDepth(l, d), d.r, d.r * d.tilt);
  return (col, x, color, bullet) => {
    const flown = bullet === undefined ? undefined : governorFlownTicks(world.cfg, bullet);
    const verdict = (w: World, c: number, k: typeof color) => governorVerdict(w, c, k, flown);
    return coreStopper(world, verdict, hub, wheel)(col, x, color);
  };
}

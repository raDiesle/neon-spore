import { type FlueState, flueVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreHurt } from "./core-hurt.js";
import { coreStopper, lowestFoot, roundFoot } from "./core-stop.js";
import {
  FLUE_DAMPER,
  FLUE_UNITS,
  flueCoreR,
  flueDamperAt,
  flueUnitAt,
  flueUnitR,
} from "./flue-shape.js";
import type { Layout } from "./layout.js";

/**
 * **Where a bolt meets THE FLUE**, for `BoltStops` (`bolt-stop.ts`): the core
 * in the damper's place, bared on a fire step, and otherwise the row of units
 * it is laid from — the damper wherever it has dropped to — `lift` pixels up
 * the field while the flue slides in.
 *
 * The damper drops *down*, into the middle column under the core it bares,
 * and a bolt the simulation says reached the core is drawn reaching it: up
 * through the dropped damper. That is a look, and it is not fixed here.
 */
export function flueStopper(
  l: Layout,
  world: World,
  s: FlueState,
  open: number,
  lift: number,
): Stopper {
  const cfg = world.cfg;
  const r = flueUnitR(l);
  const feet = Array.from({ length: FLUE_UNITS }, (_, k) => {
    const at = k === FLUE_DAMPER ? flueDamperAt(l, cfg, open) : flueUnitAt(l, cfg, k);
    return roundFoot(at.x, at.y + lift, r);
  });
  const core = flueUnitAt(l, cfg, FLUE_DAMPER).y + lift + flueCoreR(l) * coreHurt(s.hits).size;
  return coreStopper(world, flueVerdict, core, lowestFoot(feet));
}

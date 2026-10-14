import {
  type HydraState,
  hydraGone,
  hydraLitStep,
  hydraTarget,
  hydraVerdict,
  type World,
} from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, type Foot, lowestFoot, outlineFoot, roundFoot } from "./core-stop.js";
import { hydraBodyPoints } from "./hydra-body.js";
import type { HydraPose } from "./hydra-pose.js";
import { hydraMawAt } from "./hydra-shape.js";
import type { Layout } from "./layout.js";

/** How far a maw's head reaches across and down from where it hangs, in tiles. */
const MAW_HALF_TILES = 0.45;
const MAW_DEEP_TILES = 0.55;

/**
 * **Where a bolt meets THE HYDRA**, for `BoltStops` (`bolt-stop.ts`): the
 * body's lower edge across every column it covers, and every maw still
 * hanging under it on a maw level; and the open maw itself, the bolt drawn
 * up to its head, since the fire in its throat is what the bolt is for.
 * Asked by the hydra's own verdict (`sim/hydra-shot.ts`), so the picture and
 * the judgment never disagree on what a bolt hit.
 */
export function hydraStopper(
  l: Layout,
  world: World,
  s: HydraState,
  p: HydraPose,
  time: number,
): Stopper {
  const c = p.c;
  const k = p.near < 1 ? 0.15 + 0.85 * p.near : 1 - 0.4 * p.die;
  const body = hydraBodyPoints(p, time).map((q) => ({
    x: c.x + (q.x - c.x) * k,
    y: c.y + (q.y - c.y) * k,
  }));
  const feet: Foot[] = [outlineFoot(body)];
  const step = hydraLitStep(s);
  // A bolt is only `target` or `wrong` up the open maw's column: its head.
  const open = hydraTarget(world);
  const core = open === null || step === null ? c.y : hydraMawAt(l, world.cfg, step, open.piece).y;
  if (step?.head === "maw") {
    step.offsets?.forEach((_, i) => {
      if (hydraGone(s, i)) return;
      const at = hydraMawAt(l, world.cfg, step, i);
      feet.push(roundFoot(at.x, at.y, MAW_HALF_TILES * l.tile, MAW_DEEP_TILES * l.tile));
    });
  }
  return coreStopper(world, hydraVerdict, core, lowestFoot(feet));
}

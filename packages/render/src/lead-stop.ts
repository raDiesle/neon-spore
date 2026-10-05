import { leadVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { outlineFoot } from "./core-stop.js";
import type { Layout } from "./layout.js";
import { leadRidgePoints } from "./lead-shape.js";

/**
 * **Where a bolt meets THE LEAD**, for `BoltStops` (`bolt-stop.ts`): the
 * ridge's underside, which spans the field, so every column meets it.
 *
 * What it meets there is what the simulation will do with it
 * (`leadVerdict`). While the stalk paces with segments to shoot, the bolt is
 * put in the air above the ridge and drawn climbing out of its underside
 * (`lead-draw.ts`' flights), so it ends there with no burst: `pass`. Any
 * other time it is the plating in the body's own column or the bare rock
 * anywhere else, and both are a scuff and nothing more: `body`.
 */
export function leadStopper(l: Layout, world: World, time: number): Stopper {
  const foot = outlineFoot(leadRidgePoints(l, world.cfg, time));
  return (col, x) => {
    const y = foot(x);
    if (y === null) return null;
    return { y, hit: leadVerdict(world, col) === "flight" ? "pass" : "body" };
  };
}

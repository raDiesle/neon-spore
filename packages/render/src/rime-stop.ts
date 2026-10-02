import { rimeVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, type Foot, lowestFoot, outlineFoot, roundFoot } from "./core-stop.js";
import type { Layout } from "./layout.js";
import { type Point, rimeCoreR, rimeLensPoints } from "./rime-shape.js";

/** What of THE RIME stands this frame: the lens unless it has shattered, the core's size, the icicle if one hangs. */
export interface RimeStand {
  /** The lens's middle on the field, shaken as drawn. */
  at: Point;
  whole: boolean;
  size: number;
  icicle: { at: Point; long: number; half: number } | null;
}

/**
 * **Where a bolt meets THE RIME**, for `BoltStops` (`bolt-stop.ts`): the
 * core behind the frost, bared on a fire step, at its near rim, and
 * otherwise the lens's edge while it is whole — the core alone once it has
 * shattered — and the icicle, wherever one hangs over its column.
 *
 * The lens stands face-on with the core at its middle, so a bolt up the
 * middle column to a bared core crosses the glass on its way.
 */
export function rimeStopper(l: Layout, world: World, r: RimeStand): Stopper {
  const core = rimeCoreR(l) * r.size;
  const feet: Foot[] = [roundFoot(r.at.x, r.at.y, core)];
  if (r.whole) feet.push(outlineFoot(rimeLensPoints(l), r.at.x, r.at.y));
  const ice = r.icicle;
  if (ice !== null)
    feet.push(roundFoot(r.at.x + ice.at.x, r.at.y + ice.at.y, ice.half, ice.long / 2));
  return coreStopper(world, rimeVerdict, r.at.y + core, lowestFoot(feet));
}

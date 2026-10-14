import { type ChrysalisState, chrysalisVerdict, midCol, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import type { ChrysalisPose } from "./chrysalis-pose.js";
import { chrysalisHidePoints, chrysalisPoreAt, chrysalisReach } from "./chrysalis-shape.js";
import { coreStopper, outlineFoot } from "./core-stop.js";
import type { Layout } from "./layout.js";

/**
 * **Where a bolt meets THE CHRYSALIS**, for `BoltStops` (`bolt-stop.ts`): the
 * cocoon's lower edge across every column it covers, the outline of the
 * skin on it now; and, while the heart beats, its pore — the bolt drawn past
 * the edge and up to it, since the pore is a way in through the membrane.
 * Asked by the cocoon's own verdict (`sim/chrysalis-shot.ts`), so the picture
 * and the judgment never disagree on what a bolt hit.
 */
export function chrysalisStopper(
  l: Layout,
  world: World,
  s: ChrysalisState,
  p: ChrysalisPose,
  time: number,
): Stopper {
  const c = p.c;
  const k = p.near < 1 ? 0.15 + 0.85 * p.near : 1;
  const r = chrysalisReach(l, s) * k;
  const shape = { r, breathe: p.breathe, bloat: p.bloat, squeeze: p.squeeze, time };
  const foot = outlineFoot(chrysalisHidePoints(c, shape));
  const mid = midCol(world.cfg);
  const core = (col: number): number => chrysalisPoreAt(l, world.cfg, c, col - mid).y;
  return coreStopper(world, chrysalisVerdict, core, foot);
}

import { type GallState, gallVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreHurt } from "./core-hurt.js";
import { coreStopper, lowestFoot, roundFoot } from "./core-stop.js";
import { gallRipple, gallRootAt, gallRootR, gallSeamFoot } from "./gall-shape.js";
import type { Layout } from "./layout.js";

/**
 * **Where a bolt meets THE GALL**, for `BoltStops` (`bolt-stop.ts`): the
 * root, bared on a fire step under the parted seam, at its near rim, and
 * otherwise the seam's underside across the field — the root itself where
 * the seam has parted round it. The nodule grows out of the seam's top and
 * never hangs below it, so it is not asked.
 */
export function gallStopper(
  l: Layout,
  world: World,
  s: GallState,
  time: number,
  ripple: number,
  part: number,
  shake: number,
): Stopper {
  const root = gallRootAt(l, world.cfg);
  const y = root.y + gallRipple(l, root.x, time, ripple);
  const r = gallRootR(l) * part * coreHurt(s.hits).size;
  const seam = (x: number) => gallSeamFoot(l, x, time, ripple, part);
  const feet = part > 0 ? [seam, roundFoot(root.x + shake, y, r)] : [seam];
  return coreStopper(world, gallVerdict, y + r, lowestFoot(feet));
}

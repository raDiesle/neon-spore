import { type GallState, gallVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper } from "./core-stop.js";
import { gallPointAt, gallRipple, gallSeamFoot } from "./gall-shape.js";
import type { Layout } from "./layout.js";

/**
 * **Where a bolt meets THE GALL**, for `BoltStops` (`bolt-stop.ts`): the
 * seam's underside across the field, and on a fire step the alien's own
 * column under the point it sits on. The alien stands on the seam's top and
 * never hangs below it, so it is not asked a foot of its own.
 */
export function gallStopper(
  l: Layout,
  world: World,
  s: GallState,
  time: number,
  ripple: number,
  shake: number,
): Stopper {
  const at = gallPointAt(l, world.cfg, s.point);
  const seam = (x: number) => gallSeamFoot(l, x + shake, time, ripple);
  const y = seam(at.x) ?? at.y + gallRipple(l, at.x, time, ripple);
  return coreStopper(world, gallVerdict, y, seam);
}

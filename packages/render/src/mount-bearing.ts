import type { Body } from "./creature-body-in.js";
import { hubOf } from "./gyre-place.js";

/**
 * Where on its wheel a mount stands, for a look that turns with it.
 *
 * Its own file rather than the bottom of `mount-look.ts`, where it was written:
 * the record points at TAPROOT, TAPROOT asks which way to face, and the two
 * would import each other (`lid-look.ts` gives the same reason).
 */
/**
 * Which way a mount faces on its wheel: the bearing from the hub to the tile
 * it stands on, in screen radians — 0 to the right, `π/2` straight down. Off
 * the tiles rather than the drawn centres, so it steps with the click and a
 * look keyed on it can cache one contour per step. `null` for a body that
 * rides no wheel, which a mount never is; the fallback is the caller's.
 */
export function mountBearing(b: Body): number | null {
  const hub = hubOf(b.world, b.c);
  if (hub === null) return null;
  return Math.atan2(b.c.row - hub.row, b.c.col - hub.col);
}

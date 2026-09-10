import type { CreatureSilhouette } from "@neon-spore/content";
import type { Body } from "./creature-body-in.js";
import { hubOf } from "./gyre-place.js";

/**
 * THE ONE RECORD A CANDIDATE **MOUNT** PATCHES.
 *
 * A mount is a slick or a bulb standing on THE GYRE's rim, and it has always
 * been drawn as exactly that — `wornKind` hands it to the ordinary living
 * draw, and `gyre.ts` says why: what the pair reads off a wheel is *the
 * colour standing in a column*, and a mount that looked like anything else
 * would be a new word. On 10 September 2026 the owner asked for that word
 * anyway — a mount that reads as a mount at a glance — so this is the seam
 * that lets one be offered without deciding it: the **contour** a mount is
 * drawn with, or `undefined` for the body it wears.
 *
 * Only the contour, on purpose. Its colour is where it stands on the rim
 * (`mountColor`) and is the whole mechanic; its skin, its interior and its
 * sway are the living draw's, already argued under the slick's and the
 * bulb's own slots. A look here changes the outline and nothing else, the
 * way THE BEATBOX's arms do (`drawLivingBody`'s `shape`).
 *
 * **The shipped answer is no answer**: `undefined`, and `drawLivingBody`
 * draws the slick or the bulb as it always has. Not one pixel moved.
 */
export interface MountLook {
  /** The contour this mount is drawn with, or `undefined` for its worn kind's. */
  readonly shape: (b: Body) => CreatureSilhouette | undefined;
}

export const MOUNT_LOOK: MountLook = { shape: () => undefined };

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

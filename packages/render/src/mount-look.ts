import type { CreatureSilhouette } from "@neon-spore/content";
import type { Body } from "./creature-body-in.js";
import { taproot } from "./mount-taproot.js";

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
 * **The shipped answer was no answer** until 11 September 2026 — `undefined`,
 * the slick or the bulb as it always was. The owner then took TAPROOT: the
 * body held to the rim by roots reaching in toward the hub
 * (`mount-taproot.ts`). RASP, the burr, is kept on the GRAPHICS page's LIBRARY.
 */
export interface MountLook {
  /** The contour this mount is drawn with, or `undefined` for its worn kind's.
   * Writable, like every field a look goes through: the LIBRARY swaps it for
   * the length of one card and puts it back. */
  shape: (b: Body) => CreatureSilhouette | undefined;
}

export const MOUNT_LOOK: MountLook = { shape: taproot };

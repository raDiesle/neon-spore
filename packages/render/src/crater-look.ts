import type { Crater } from "./crater-geom.js";
import { pit } from "./crater-pit.js";
import type { HullSkin } from "./hull.js";

/**
 * THE ONE RECORD A CANDIDATE **CRATER** PATCHES.
 *
 * `magnet-look.ts`'s kind and its reasons. What sits behind it is the ship's
 * own damage: the hole a rock tore in the membrane, drawn every frame from the
 * scar list and never as a transient, so it is on screen for the rest of the
 * wave and is the one piece of damage the pair reads at a glance to know how
 * the run is going.
 *
 * The record is deliberately **only the pit**. Where a crater is, how wide its
 * mouth is, which columns it covers and whether the hull's rim is cut out over
 * it are all still `craters.ts`'s and `hull.ts`'s, and a candidate cannot move
 * any of them — the mouth is read by `scars.ts` to start a crack on the rim and
 * by `clipOutMouths` to break the outline, so a look that changed it would be
 * changing where the damage *is* rather than what it looks like. A look may
 * argue about the picture inside the hole and about nothing else.
 *
 * **"Inside the hole" is enforced rather than asked for.** `hull.ts` clips
 * every crater to the ship's own filled contour before it calls this, so a
 * look cannot draw a plate, a grain or a lip above the surface however it
 * measures — which is the defect the first candidate through here shipped
 * with, and the reason a look is handed the membrane's *colours* and not its
 * shape.
 *
 * The `HullSkin` is the seat's (`seat-skin.ts`), and taking it is not
 * optional: player two's ship is amber and THE MIRROR's is blood, so a hole
 * painted out of `PALETTE` is player one's violet on two ships that are not
 * his.
 */
export const CRATER_LOOK: {
  pit: (ctx: CanvasRenderingContext2D, c: Crater, skin: HullSkin) => void;
} = { pit };

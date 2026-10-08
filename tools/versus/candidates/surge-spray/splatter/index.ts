import * as spray from "../../../../../packages/render/src/surge-spray.js";
import { patch, type Variant } from "../../../variant.js";
import { paintSplatter } from "./paint.js";

/**
 * SPLATTER — offered 8 October 2026, the last of THE SURGE's three unbuilt
 * looks (bosses.md §11.28): a burst that sprays the whole ship. The game
 * draws nothing past the burst's sparks and jolt; this throws gobs of the
 * bulb wall to wall and leaves them on the hull for the spray's beats.
 */
export const SURGE_SPLATTER: Variant = {
  slot: "surge:spray",
  name: "splatter",
  sentence:
    "splatter — the burst throws gobs of the bulb across the whole field, wall to wall, and they land on the hull as splats that sag and fade",
  dir: "tools/versus/candidates/surge-spray/splatter",
  patches: [
    patch({
      target: spray.SPRAY_LOOK,
      reached: () => spray.SPRAY_LOOK,
      where: {
        file: "packages/render/src/surge-spray.ts",
        symbol: "SPRAY_LOOK",
        type: "SprayLook",
      },
      fields: { draw: paintSplatter },
    }),
  ],
};

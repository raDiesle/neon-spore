import * as hullLight from "../../../../../packages/render/src/hull-light.js";
import { patch, type Variant } from "../../../variant.js";
import { barrel } from "./barrel.js";

/**
 * `ship:light` / `barrel` — the ship lit by the surface it has, not by the box
 * it is drawn in.
 *
 * The direction the owner named on 8 September 2026 is that the graphics should
 * look three-dimensional while staying 2D, and `docs/style-guide.md` says where
 * that is reachable: **a silhouette is posed and a surface is placed**. Every
 * shipped use of that rule so far is a *creature* or a director card. The ship
 * is the largest thing on the screen and the one thing on it every frame, and
 * its light is a straight ramp from one corner of a rectangle to the other.
 *
 * So this replaces the ramp with the membrane's own cosine: the field spans
 * 66° of a barrel, `packages/content`'s `surfaceLit` says how much light the
 * surface takes at each of them, and a second pass strokes the contour with a
 * vertical ramp so a lobe rising toward the light is brighter at its crown than
 * in the troughs either side. Nothing moves that did not move before — this is
 * a change to *graphics*, and it reads on a still.
 *
 * How it can lose, in one sentence, because the pair should be looking for it:
 * a cosine with a terminator inside the field makes the right-hand columns
 * quieter than the left, on a screen where eleven columns of ammunition have to
 * be read by colour at 26 px.
 */
export const SHIP_BARREL: Variant = {
  slot: "ship:light",
  name: "barrel",
  sentence:
    "the hull lit by where its surface points rather than by a ramp across its box — a cosine across the field with a terminator in it, and every lobe brighter at its crown",
  dir: "tools/versus/candidates/ship-light/barrel",
  patches: [
    patch({
      target: hullLight.HULL_LIGHT,
      reached: () => hullLight.HULL_LIGHT,
      where: {
        file: "packages/render/src/hull-light.ts",
        symbol: "HULL_LIGHT",
        type: "HullLight",
      },
      fields: { lit: barrel },
    }),
  ],
};

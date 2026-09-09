import * as ship from "../../../../../packages/content/src/ship-silhouettes.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `ship:hull-shape` / `ridge` — a ribbed membrane across the whole field
 * instead of one long swell under it.
 *
 * The hull is an ellipse far wider than the screen with a lobed radius
 * function on it, and only the arc around its apex is ever in view. Two lobes
 * at a depth of 0.4 means the visible strip carries **most of one swell**: the
 * ship reads as a single smooth curve that happens to be higher on one side,
 * and its surface says nothing about itself between the cannon bump and the
 * shield bump. Everything a player reads off the top of this ship is something
 * *standing on* it.
 *
 * RIDGE is the other answer: fourteen shallow lobes instead of two deep ones,
 * so the membrane **ripples** across the field and the ship has a surface
 * rather than a profile. The count is round the whole ellipse and not across
 * the screen — only the apex arc is ever in view — which is why it takes
 * fourteen to put about three crests in front of the player, one every three or
 * four columns. That is the scale the eye reads the field at, and it is the
 * same closed-contour-with-lobes vocabulary every body in this game is drawn in
 * (CLAUDE.md), applied at last to the one object that has been exempt from it.
 *
 * **The two bumps are untouched.** `CANNON_LOBE` and `SHIELD_LOBE` are
 * separate records and neither is patched: the cannon still swells where the
 * cannon is and the shield still lifts where the shield is, at the same width
 * and the same height, so nothing a player aims with moves. What changes is
 * the membrane they stand on. `cannonRadius` and `seed` are not patched
 * either — the first is the muzzle's own size and the second is which wobble
 * this ship happens to have, and neither is the question.
 *
 * How it can lose, and there are two ways worth watching for. **A rippled
 * membrane is a row of shapes.** Eleven columns of ammunition are read against
 * the top of this ship, and three crests along it are three things that are not
 * a lobe but could be mistaken for one at a glance — the whole point of the
 * cannon and the shield bumps is that a swelling in the hull *means something*.
 * And **the drips hang off the skin** (`hullSkinY`), so a rippled hull is a
 * rippled fringe of slime under it: if that reads as busy where the shipped
 * ship reads as calm, the ship has become the loudest thing on a screen whose
 * job is to make eleven columns legible.
 */
export const HULL_RIDGE: Variant = {
  slot: "ship:hull-shape",
  name: "ridge",
  sentence:
    "fourteen shallow lobes round the hull instead of two deep ones — the ship gets a rippled surface across the field rather than one long smooth swell",
  dir: "tools/versus/candidates/ship-hull/ridge",
  patches: [
    patch({
      target: ship.HULL,
      // `hull-frame.ts` reads `HULL.lobes`, `HULL.depth` and `HULL.wobble`
      // inside `pointOn`, once per sampled point per frame, so the export
      // itself is the whole route the drawing code takes.
      reached: () => ship.HULL,
      where: {
        file: "packages/content/src/ship-silhouettes.ts",
        symbol: "HULL",
        type: "HullSilhouette",
      },
      fields: { lobes: 14, depth: 0.12, wobble: 0.05 },
    }),
  ],
};

import * as hull from "../../../../packages/render/src/hull.js";
import { patch, type Variant } from "../../variant.js";

/**
 * `ship:hull-skin` / `warm` — the player's ship in amber instead of violet.
 *
 * The first slot by construction, and the cheapest one there is: `hull.ts`'s
 * own comment says the four body stops, the rim, the edge and the muzzle
 * colour are the whole of a ship's appearance, and `MIRROR_SKIN` sitting
 * directly beneath `OWN_SKIN` already proves a complete reskin is a record
 * swap with no branch anywhere. Zero lift, and it is on screen in every frame
 * of every wave a player will ever see.
 *
 * The stops keep the shipped shape — bright at the skin, dark where the
 * membrane is thick — because that gradient is what makes a hull read as a
 * membrane rather than a plate, and changing two things at once is how a vote
 * comes back unreadable. Only the hue moves.
 *
 * The real question under this one, and the reason it is worth a vote rather
 * than an opinion: red and cyan are the two ammunition colours, so a warm hull
 * is the player's own ship wearing one side of the thing it shoots. That is
 * either a ship that finally looks like it belongs to the fight, or eleven
 * columns of red creatures with a red ship underneath them and nothing to tell
 * a player which is which at 26 px. An argument cannot settle that. Two phones
 * can.
 */
export const HULL_WARM: Variant = {
  slot: "ship:hull-skin",
  name: "warm",
  sentence: "amber where the ship is violet — does the hull still read against red ammunition",
  dir: "tools/versus/candidates/ship-hull.warm",
  patches: [
    patch({
      target: hull.OWN_SKIN,
      // No accessor: `drawHull` reads the export itself, as the default of its
      // `skin_` argument. The module namespace is the whole route there is.
      reached: () => hull.OWN_SKIN,
      where: {
        file: "packages/render/src/hull.ts",
        symbol: "OWN_SKIN",
        type: "HullSkin",
      },
      fields: {
        body: ["#FFC46B", "#D2761A", "#5E2A05", "#241000"],
        rim: "#FFAE3D",
        edge: "#FFF1D8",
        muzzle: "#2A0F08",
      },
    }),
  ],
};

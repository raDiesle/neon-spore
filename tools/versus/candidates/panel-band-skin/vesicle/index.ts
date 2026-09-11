import * as lobeLook from "../../../../../packages/render/src/lobe-look.js";
import * as shipNerves from "../../../../../packages/render/src/ship-nerves.js";
import * as slimeLook from "../../../../../packages/render/src/slime-look.js";
import { patch, type Variant } from "../../../variant.js";
import { blister, glass, sliding, veils } from "./paint.js";

/**
 * `panel:band-skin` / `vesicle` — every button is under a glass blister
 * raised on a ring of tissue, with veins running out from under it, and the
 * slime is curtains hanging between the buttons.
 *
 * GLAND's button is flesh all the way: a swelling, a crease, a wet shoulder.
 * VESICLE says the button is *fluid held under a skin* — a blister on the
 * panel, the face seen through it. The sheet's **vesicle** is the dome: a
 * haze of reflection over the whole face, one hard specular up and to the
 * left, and a fine rim light along the bottom right where the glass curves
 * away. It stands in a **node-ring**, a swollen ring of tissue lit on top and
 * in shadow underneath, over a pool darker than the flesh round it so the
 * face reads as sunk under glass; six **veins** run out from under the ring
 * across the panel. A light goes round the ring, a drop forms at the top of
 * the dome and slides down its right side; and from the roof hang **veils** —
 * wide translucent sheets between the buttons, their hems rippling — where
 * GLAND hung pendants. PLASM's beaded cords still run from each button to its
 * knob and on to the organ.
 *
 * How it can lose. A specular over the face is a highlight *on top of* the
 * creature inside a fire button, and at 26 px it may read as part of the
 * creature rather than as glass over it. And a sheet between the buttons is
 * exactly where a nerve runs; four veils plus four cords is a lot of vertical
 * in one band.
 */
export const SKIN_VESICLE: Variant = {
  slot: "panel:band-skin",
  name: "vesicle",
  sentence:
    "each button is fluid under a glass blister raised on a ring of tissue, veins running out from under it — a light goes round the ring, a drop slides down the glass, and veils hang between the buttons",
  dir: "tools/versus/candidates/panel-band-skin/vesicle",
  patches: [
    patch({
      target: lobeLook.LOBE_LOOK,
      // No accessor: `drawLobe` reads the export itself.
      reached: () => lobeLook.LOBE_LOOK,
      where: {
        file: "packages/render/src/lobe-look.ts",
        symbol: "LOBE_LOOK",
        type: "LobeLook",
      },
      fields: { socket: blister, gloss: glass },
    }),
    patch({
      target: shipNerves.SHIP_NERVES,
      reached: () => shipNerves.SHIP_NERVES,
      where: {
        file: "packages/render/src/ship-nerves.ts",
        symbol: "SHIP_NERVES",
        type: "ShipNerves",
      },
      fields: { draw: (d) => sliding(d, 4) },
    }),
    patch({
      target: slimeLook.BAND_SLIME,
      reached: () => slimeLook.BAND_SLIME,
      where: {
        file: "packages/render/src/slime-look.ts",
        symbol: "BAND_SLIME",
        type: "BandSlime",
      },
      fields: { drips: (d) => veils(d, 4) },
    }),
  ],
};

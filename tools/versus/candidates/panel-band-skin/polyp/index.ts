import * as lobeLook from "../../../../../packages/render/src/lobe-look.js";
import * as shipNerves from "../../../../../packages/render/src/ship-nerves.js";
import * as slimeLook from "../../../../../packages/render/src/slime-look.js";
import { patch, type Variant } from "../../../variant.js";
import { filaments, mouth, stalk, waving } from "./paint.js";

/**
 * `panel:band-skin` / `polyp` — every button is a polyp: it stands up out of
 * the floor on a stalk, in a cup of coral with cilia round its lip, and the
 * slime is threads hanging over it.
 *
 * GLAND put the button in a swelling of the flesh, a heart with veins. POLYP
 * says the button is not *in* the panel but *grown up out of it*, the way a
 * polyp stands on a reef: a stalk (the sheet's **stub**) rises from under the
 * band's floor and bends as it comes; the button sits in a nine-lobed cup
 * (**coral**) with sixteen short **cilia** round the lip and a bead of light
 * on every lobe; a pulse of light climbs the stalk twice a cycle and one
 * bright bead walks the lip, lighting each cilium as it passes; and what
 * hangs from the roof is **filament** — thin threads swaying over each polyp
 * with a drop at the end of some, not GLAND's pendants. PLASM's beaded cords
 * still run from each button to its knob and on to the organ.
 *
 * How it can lose. The stalk is the tallest thing on the panel and it stands
 * *behind* the button, so on a short band the foot of it may be under the
 * screen's edge and the polyp reads as a cup on a stick that goes nowhere.
 * And a cup with a comb-row of light round it is a busier ring than a thumb
 * wants to land on.
 */
export const SKIN_POLYP: Variant = {
  slot: "panel:band-skin",
  name: "polyp",
  sentence:
    "each button stands up out of the floor on a stalk, in a coral cup with cilia round its lip — light climbs the stalk and threads hang over it from the roof",
  dir: "tools/versus/candidates/panel-band-skin/polyp",
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
      fields: { socket: stalk, gloss: mouth },
    }),
    patch({
      target: shipNerves.SHIP_NERVES,
      reached: () => shipNerves.SHIP_NERVES,
      where: {
        file: "packages/render/src/ship-nerves.ts",
        symbol: "SHIP_NERVES",
        type: "ShipNerves",
      },
      fields: { draw: (d) => waving(d, 2) },
    }),
    patch({
      target: slimeLook.BAND_SLIME,
      reached: () => slimeLook.BAND_SLIME,
      where: {
        file: "packages/render/src/slime-look.ts",
        symbol: "BAND_SLIME",
        type: "BandSlime",
      },
      fields: { drips: (d) => filaments(d, 3) },
    }),
  ],
};

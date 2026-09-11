import * as lobeLook from "../../../../../packages/render/src/lobe-look.js";
import * as shipNerves from "../../../../../packages/render/src/ship-nerves.js";
import * as slimeLook from "../../../../../packages/render/src/slime-look.js";
import { patch, type Variant } from "../../../variant.js";
import { lip, peristalsis, rings, web } from "./paint.js";

/**
 * `panel:band-skin` / `sucker` — every button is the mouth of a sucker: a
 * flat disc of concentric ridges with an arm trailing off the bottom of it,
 * and the slime is a web strung from the roof down to the discs.
 *
 * GLAND's button is a heart — round, swollen, veined. SUCKER says the button
 * is a *mouth on an arm*, the way a sucker sits on a tentacle: a wide flat
 * pad (the sheet's **rings**) with four ridges each lit on its upper edge and
 * dark below, a cavity the face sits down in, and the sucker's own **ridge**
 * on the face as a full lit ring with a darker one inside it; off the bottom
 * of every pad an **oral-arm** trails down and to one side, carrying three
 * smaller suckers. A ridge of light moves outward across the pad, slowly, the
 * way a sucker grips, and the small suckers on the arm light in turn down its
 * length; and from the roof hangs **web-fin** — threads to the top of every
 * disc with a membrane between neighbours and dew at its low points — where
 * GLAND hung pendants. PLASM's beaded cords still run from each button to its
 * knob and on to the organ.
 *
 * How it can lose. The pad is the widest thing in the slot — nearly four
 * button radii across — and on player two's screen, where two buttons stand
 * a pitch apart, two pads overlap and the ridges of one run under the other.
 * And an arm going down and to one side is the first thing on the panel with
 * a direction, and a thumb may read it as an arrow.
 */
export const SKIN_SUCKER: Variant = {
  slot: "panel:band-skin",
  name: "sucker",
  sentence:
    "each button is the mouth of a sucker — a flat disc of concentric ridges with an arm trailing off it carrying smaller suckers, light gripping outward across the disc, and a web strung from the roof down to it",
  dir: "tools/versus/candidates/panel-band-skin/sucker",
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
      fields: { socket: rings, gloss: lip },
    }),
    patch({
      target: shipNerves.SHIP_NERVES,
      reached: () => shipNerves.SHIP_NERVES,
      where: {
        file: "packages/render/src/ship-nerves.ts",
        symbol: "SHIP_NERVES",
        type: "ShipNerves",
      },
      fields: { draw: (d) => peristalsis(d, 3) },
    }),
    patch({
      target: slimeLook.BAND_SLIME,
      reached: () => slimeLook.BAND_SLIME,
      where: {
        file: "packages/render/src/slime-look.ts",
        symbol: "BAND_SLIME",
        type: "BandSlime",
      },
      fields: { drips: (d) => web(d, 2) },
    }),
  ],
};

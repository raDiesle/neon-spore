import * as chuteLook from "../../../../../packages/render/src/chute-look.js";
import { patch, type Variant } from "../../../variant.js";
import { pulses, ribbed } from "./paint.js";

/**
 * `creature:chute` / `ribs` — the canopy has a frame, and the membrane sags
 * between it.
 *
 * **What the shipped side is.** One smooth curve with a wash under it. A dome
 * with nothing inside it has no width to lose: the sway tilts the whole picture
 * at one rate, which is the 1.10 : 1 `docs/dimensional.md` measures an affine
 * at, against the 22.9 : 1 a placed feature gives. The hem is a single
 * unbroken arc, which is the shape a lens has and a stretched skin does not.
 *
 * **What this argues.** That a hanging membrane is read at its **edge**. Four
 * ribs placed by longitude and carried round by the sway — the near pair wide,
 * the pair reaching the limb narrowing to a hairline by the tangent plane's own
 * foreshortening rather than by anything clamped — and between each pair the
 * skin sags, so the bottom edge is a scallop whose dips deepen as the panel
 * spanning them comes toward us. A rib is a thickening of the material and not
 * a strut, because everything in this game that is not rock is grown. The plume
 * becomes three stacked pulses leaving on their own clock, so the ascent has a
 * rhythm the eye can count — a body being *pumped* upward rather than sliding.
 *
 * **How it can lose.** *A scalloped hem is a jellyfish's, and the ribs argue
 * the other way.* This candidate is two claims at once — a frame, which says
 * made, and a sag, which says grown — and if at the pair they cancel, the
 * canopy reads as neither. And three pulses a second under a body that also
 * carries a canopy on the way back down is the busiest thing on this page.
 */
export const CHUTE_RIBS: Variant = {
  slot: "creature:chute",
  name: "ribs",
  sentence:
    "a canopy with a frame the skin hangs off — four ribs placed by longitude and carried round by the sway, the membrane sagging between each pair into a scalloped hem, over a plume of three pulses leaving on their own clock",
  dir: "tools/versus/candidates/creature-chute/ribs",
  patches: [
    patch({
      target: chuteLook.CHUTE_LOOK,
      // No accessor: `chute.ts` reads the export itself, once per body.
      reached: () => chuteLook.CHUTE_LOOK,
      where: {
        file: "packages/render/src/chute-look.ts",
        symbol: "CHUTE_LOOK",
        type: "ChuteLook",
      },
      fields: { canopy: ribbed, plume: pulses },
    }),
  ],
};

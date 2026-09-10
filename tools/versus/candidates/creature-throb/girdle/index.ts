import * as throbLook from "../../../../../packages/render/src/throb-look.js";
import { patch, type Variant } from "../../../variant.js";
import { girdle } from "./paint.js";

/**
 * `creature:throb` / `girdle` — the cut between the two colours is a ridge
 * with a thickness, and the far half is a dome.
 *
 * **What the shipped side is.** The far colour laid flat inside its meridian
 * and the meridian stroked once in the mixed hue: a boundary with no
 * thickness on a surface with no bulge, so what says *ball* is the seam's
 * width alone.
 *
 * **What this argues.** That the seam is a *thing* — WELT off the shapes
 * page, a raised ring round the body where two materials meet — and a thing
 * takes the light. The meridian is stroked three times: a shadow flank
 * offset away from the key, a lit flank offset toward it, the mixed hue
 * between; both offsets are in screen space, so the lit flank stays on the
 * key's side while the ridge swings from a line to the limb and back. Under
 * it the far half is a radial gradient with its bright centre toward the key
 * and a cool dark at its edge, so the painted hemisphere bulges. The
 * interior marks and the light pass are the shipped ones.
 *
 * **How it can lose.** *Three strokes on a two-pixel seam is a smear.* The
 * ridge is drawn at line widths, and a throb is thirty pixels across; if at
 * true size the three read as one thicker line, the flanks have to go and
 * the dome alone has to carry it.
 */
export const THROB_GIRDLE: Variant = {
  slot: "creature:throb",
  name: "girdle",
  sentence:
    "the cut between the colours as a raised welt with a lit flank and a shadow flank, and the far half a dome lit toward the key — a ridge round a ball, not a line across a disc",
  dir: "tools/versus/candidates/creature-throb/girdle",
  patches: [
    patch({
      target: throbLook.THROB_LOOK,
      // No accessor: `living-draw.ts` reads the export itself. The module
      // namespace is the whole route there is.
      reached: () => throbLook.THROB_LOOK,
      where: {
        file: "packages/render/src/throb-look.ts",
        symbol: "THROB_LOOK",
        type: "ThrobLook",
      },
      fields: { half: girdle },
    }),
  ],
};

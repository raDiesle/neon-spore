import * as rindLook from "../../../../../packages/render/src/rind-look.js";
import { patch, type Variant } from "../../../variant.js";
import { burr } from "./paint.js";

/**
 * `rind:body` / `burr` — a rind wearing knobs that come off with the layers.
 *
 * **What the shipped side is.** A big slick or a big bulb, told from the
 * ordinary one by size alone.
 *
 * **What this argues.** That a rind is a body with something *on* it, and
 * the plainest picture of something on a body is a rim of knobs. The
 * `studded` form on the shapes page is taken as it is and asked for a
 * different rim per layer: seven fat knobs standing well off the body with
 * both layers on, four shorter ones with one, the ordinary blob when bare — so
 * the pair sees the knobs go with the skin, and the count is in the outline
 * as well as in the size. Wide and blunt on purpose: a spine is THE
 * BRISTLE's word, and a knob says *grown* rather than *armed*. Colour, size
 * and interior are the creature's own; the husk the shed throws is this
 * knobbed contour.
 *
 * **How it can lose.** *Knobs are lobes.* A slick has two and a bulb has
 * six, and seven fat knobs round a body may read as a very lobed bulb rather
 * than as a thing wearing something. The reach is what keeps them apart — a
 * knob stands off the body further than a lobe swells — and if at the pair
 * that is not enough, the knobs go fewer and longer, or this loses.
 */
export const RIND_BODY_BURR: Variant = {
  slot: "rind:body",
  name: "burr",
  sentence:
    "the rind wears a rim of fat knobs — seven standing well off the body with both layers on, four shorter with one, none when bare — the shapes page's studded form asked for a different rim per layer, so the knobs are seen to go with the skin",
  dir: "tools/versus/candidates/rind-body/burr",
  patches: [
    patch({
      target: rindLook.RIND_LOOK,
      // No accessor: `creature-body.ts` and `rind-shed.ts` reach the record
      // through `rindWears`, which reads the export itself.
      reached: () => rindLook.RIND_LOOK,
      where: {
        file: "packages/render/src/rind-look.ts",
        symbol: "RIND_LOOK",
        type: "RindLook",
      },
      fields: { body: burr },
    }),
  ],
};

import * as magnet from "../../../../../packages/render/src/magnet.js";
import { patch, type Variant } from "../../../variant.js";
import { coil } from "./paint.js";

/**
 * `creature:magnet` / `coil` — the horseshoe is a solid, its poles are lit
 * from their ends, and the way in has a direction drawn on it.
 *
 * The shipped magnet is three flat greys and two wedges of colour. It states
 * its rule honestly and it states two thirds of it: there is a plate
 * underneath, and the way in has a colour. What it never says is the third
 * clause and the hardest one — that a shot only gets in **sideways**
 * (`sim/magnet.ts`'s `magnetLetsThrough`, one question and no number: did this
 * bolt cross any part of a column on the tick it landed). Worse, the one
 * opening the picture *does* have is at the bottom, which is the single
 * bearing the rule refuses. The pair learns "not from underneath" by losing a
 * shot to the plate, and then has to be told the rest out loud.
 *
 * COIL keeps every path. `magnetOutline` in `packages/content` is the
 * silhouette the shape sheet judges and the nameability gate reads, and the
 * horseshoe-plus-plate is the whole of why this body is nameable — so the
 * contour is imported, not redrawn, and three things change on it.
 *
 * **The body becomes solid.** `litRound` over the arch and `litBox` over the
 * plate, both the shipped ramp at the shipped `KEY`: the horseshoe reads as a
 * bent bar and the plate as a thick slab, where today both read as shapes cut
 * out of card. Nothing here invents a light angle.
 *
 * **The poles light from their ends.** A radial gradient standing on each tip
 * and falling to the body's own dark within two thirds of a radius, instead of
 * a flat wedge with a halo over it — so the bright part of the body is exactly
 * the part a bolt has to reach.
 *
 * **And each pole grows a lane.** A level rail in that pole's own colour,
 * running out past the arch on that side with two hollow chevrons on it
 * pointing in. That is the missing clause, drawn: *from your left, red*. It
 * also buys the body drawn size — a magnet is about twenty-eight pixels across
 * on a phone, and the lane is the only reach this candidate is allowed that
 * the contour is not.
 *
 * How it can lose, and there are three ways worth the pair's time. **Eleven
 * columns.** Two lanes per body, each reaching two thirds of a tile past the
 * arch, means a row of magnets throws lit rails into its neighbours' columns —
 * and a field that reads as a lattice of beams has lost the thing the pair is
 * counting. **A lane is a standing claim, not a state.** `docs/style-guide.md`
 * says glow is state and never decoration, and this glow is on for as long as
 * the body is: the defence is that it is the same class of thing as the pole
 * colours and the plate — a rule the body wears permanently — but that is an
 * argument, and an eye at tempo settles it. **And red and cyan pointing at a
 * body may still read as ammunition in flight**, chevrons or not, on the one
 * creature in the game the pair has to describe a *bearing* for.
 */
export const MAGNET_COIL: Variant = {
  slot: "creature:magnet",
  name: "coil",
  sentence:
    "a solid horseshoe, poles lit from their tips, and a chevron lane at each side — the way in is across, not up",
  dir: "tools/versus/candidates/creature-magnet/coil",
  patches: [
    patch({
      target: magnet.MAGNET_LOOK,
      // No accessor: `creature-body.ts` routes the magnet away from the living
      // pass and calls `MAGNET_LOOK.body` on the export itself. The module
      // namespace is the whole route there is.
      reached: () => magnet.MAGNET_LOOK,
      where: {
        file: "packages/render/src/magnet.ts",
        symbol: "MAGNET_LOOK",
        type: "{ body: (d: MagnetDraw) => void }",
      },
      fields: { body: coil },
    }),
  ],
};

import * as join from "../../../../../packages/render/src/band-join.js";
import { patch, type Variant } from "../../../variant.js";
import { saggingRoof } from "../fused/tissue.js";
import { draped } from "./paint.js";

/**
 * `panel:ship-join` / `caul` — nothing is grown, because nothing is separate.
 *
 * The owner asked for a panel that reads as *a single alien ship where
 * everything is grown together*, and there are two ways to answer that. Every
 * other card in this slot takes the first: grow the connecting parts so well
 * that the joins stop showing. This takes the second: **have no connecting
 * parts at all.** The ship does not end at the membrane and then reach down to
 * its buttons — it hangs, as one sheet, over the whole width, and the controls
 * are simply where it comes down far enough to wrap them.
 *
 * The hem is the shape of the argument. It reaches its lowest around every
 * control and rises between them, so the sheet reads as webbing between
 * fingers: one piece of tissue whose edge happens to go round things. A second
 * sheet hangs behind it, shorter and darker, so the caul has a thickness rather
 * than being a cut-out; nine creases run down it, because a sheet of anything
 * that hangs has creases and without them this is a fill with a wavy bottom.
 *
 * **It puts a lit line back on the panel, which was removed once.** The owner
 * took the rim off the seam and said why: *there is this wave line of control
 * panel and then immediately comes the ship … remove the line*. This is not
 * that line and is deliberately nowhere near it — it is most of a panel's
 * height below the join, and it lights the ship's own bottom edge rather than
 * the boundary between two things. If it reads as a second seam anyway, that is
 * the clearest way this card loses, and it should lose on it.
 *
 * The other way it loses: a sheet across the whole width is a lot of tissue
 * over the part of the screen a pair reads fastest, and it may simply be too
 * much wall behind the buttons.
 */
export const JOIN_CAUL: Variant = {
  slot: "panel:ship-join",
  name: "caul",
  sentence:
    "nothing grows out of the ship because nothing is separate from it — one sheet of tissue hangs the whole width of the panel, its hem coming down around every control and rising between them like webbing between fingers",
  dir: "tools/versus/candidates/panel-join/caul",
  patches: [
    patch({
      target: join.BAND_JOIN,
      reached: () => join.BAND_JOIN,
      where: {
        file: "packages/render/src/band-join.ts",
        symbol: "BAND_JOIN",
        type: "BandJoin",
      },
      fields: { ceiling: saggingRoof(4.5, 0.22), attach: draped },
    }),
  ],
};

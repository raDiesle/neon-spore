import * as caromLook from "../../../../../packages/render/src/carom-look.js";
import { patch, type Variant } from "../../../variant.js";
import { bow, keeled } from "./paint.js";

/**
 * `creature:carom` / `keel` — the rock has a side that goes first, and it is
 * pushing through something.
 *
 * **What the shipped side is.** One round key pass on a uniform fill, and a
 * wedge of the body's colour trailing behind. Nothing in either half knows
 * which way the thing is *going* except the wedge's direction, so the crust
 * itself is the same picture crossing left as crossing right — a rock being
 * slid rather than a rock with a bow.
 *
 * **What this argues.** That the cheapest way to say *travelling* is to light
 * the leading edge and put something in front of it. The shell keeps the
 * shipped key pass and adds the two zones it leaves out: a terminator with the
 * cool reflected light standing in its far edge, six stops rather than three,
 * and a rim light along whichever side `caromHeading` says is forward. The
 * streak becomes a **bow** — a thin bright crescent standing a sixth of a
 * radius off the leading edge with two narrow wakes peeling back off the
 * shoulders — so the picture is of a solid displacing what it moves through.
 * The specular is deliberately left out: the window already carries one, and a
 * second highlight on the rock beside it is two light sources.
 *
 * **How it can lose.** *A bow wave is weather, and space has none.* Nothing
 * else in this game pushes anything aside, so a front standing off a rock may
 * read as a shield the pair does not have rather than as speed. And a rim light
 * that swaps sides at every wall is a rock that changes colour twice a
 * descent, which at twenty-six pixels could read as a flicker rather than as a
 * turn.
 */
export const CAROM_KEEL: Variant = {
  slot: "creature:carom",
  name: "keel",
  sentence:
    "a rock with a side that goes first — lit as a ball with a cool bounce in the far edge of its terminator and a rim light down the leading edge, pushing a thin bright crescent ahead of it with two wakes peeling off its shoulders",
  dir: "tools/versus/candidates/creature-carom/keel",
  patches: [
    patch({
      target: caromLook.CAROM_LOOK,
      // No accessor: `carom.ts` reads the export itself, twice per body.
      reached: () => caromLook.CAROM_LOOK,
      where: {
        file: "packages/render/src/carom-look.ts",
        symbol: "CAROM_LOOK",
        type: "CaromLook",
      },
      fields: { shell: keeled, travel: bow },
    }),
  ],
};

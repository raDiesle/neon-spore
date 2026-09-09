import * as craterLook from "../../../../../packages/render/src/crater-look.js";
import { patch, type Variant } from "../../../variant.js";
import { grit } from "./paint.js";

/**
 * `ship:crater` / `grit` — the lip is still coming away, in crumb.
 *
 * **What the shipped side is.** `spall`, taken into the game on 9 September
 * 2026 (`crater-spall.ts`): the membrane around a hole cut into eleven plates
 * whose inner edges are the hole's own rim, each pulled toward the pit and
 * turned a degree or two out of true. It is right about the important thing —
 * a hole in a skin takes the skin with it — and it has exactly one size of
 * piece, so the lip is eleven clean edges meeting the dark.
 *
 * **What this argues.** A break in a sheet has two sizes of piece, and the
 * small one is the one that says the break was violent: slabs that stayed
 * attached, and crumb along the failure line. This cuts the ring a second time
 * at more than twice the count in the narrow band that touches the mouth, and
 * lets those pieces sit pushed out and turned. The owner asked for it by name
 * — *see that still top of craters are crumbling of smaller stone pieces part
 * of crater* — and `shards` next door is the same geometry in the rock's greys
 * instead of the ship's.
 *
 * **What it may not touch, and does not.** The plates, the hole, the seam and
 * the mouth. It calls `spallRing`, `hole` and `seam` rather than carrying
 * copies, so the shipped picture underneath is the shipped picture; and the
 * pieces are painted by `facet` (`break-piece.ts`), so what a broken fragment
 * of this game looks like is still decided in one place. All this candidate
 * owns is where the second cut is and how fine.
 *
 * **How it can lose.** *It is noise at the size a phone draws it.* Read
 * `paint.ts` — the honest test is the small craters on the sheet, not the wide
 * one.
 */
export const CRATER_GRIT: Variant = {
  slot: "ship:crater",
  name: "grit",
  sentence:
    "the lip of the hole is cut a second time, much finer, so the break has crumb along it as well as plates — the ship's own material, still coming away",
  dir: "tools/versus/candidates/ship-crater/grit",
  patches: [
    patch({
      target: craterLook.CRATER_LOOK,
      // No accessor: `drawCraters` reads the export itself, once per crater per
      // frame. The module namespace is the whole route there is.
      reached: () => craterLook.CRATER_LOOK,
      where: {
        file: "packages/render/src/crater-look.ts",
        symbol: "CRATER_LOOK",
      },
      fields: { pit: grit },
    }),
  ],
};

import * as throbLook from "../../../../../packages/render/src/throb-look.js";
import { patch, type Variant } from "../../../variant.js";
import { pores } from "./paint.js";

/**
 * `creature:throb` / `pores` — the far half wears marks that are *on* it,
 * each crossing at its own rate.
 *
 * **What the shipped side is.** GLOBE: the far colour bounded by a meridian
 * that swells and shuts twice a turn, which is the right seam — and inside
 * it the body's own interior marks, narrowed with the surface by scaling the
 * whole drawing. That scale moves every mark at one rate, 1.10 : 1, which
 * `docs/dimensional.md` measures as the sticker shrinking: the seam says
 * *ball* and the marks inside it say *window*.
 *
 * **What this argues.** That the marks should be placed, not posed. Seven
 * pores pinned by `pin` at longitudes of the far hemisphere and latitudes
 * off the poles, carried by `facet` at the throb's own turn, each drawn about
 * its own origin and foreshortened by the tangent plane's map — so a pore
 * crosses the middle fast, crawls at the limb, and narrows to nothing there
 * rather than being cut by the seam, 22.9 : 1. Two or three are on the near
 * side at any instant. The fill, the rim, the seam and the light pass are
 * the shipped ones.
 *
 * **How it can lose.** *Seven dots on thirty pixels is a rash.* At the size
 * a throb draws at, a pore is two pixels across, and the reveal the pins
 * exist for may be a flicker rather than a motion. `bun run versus:shot` at
 * true size is the check, not the magnified pair.
 */
export const THROB_PORES: Variant = {
  slot: "creature:throb",
  name: "pores",
  sentence:
    "seven pores pinned on the far hemisphere and carried round by the turn, each crossing the middle fast and crawling at the limb — marks on a ball, instead of the body's interior squashed as one picture",
  dir: "tools/versus/candidates/creature-throb/pores",
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
      fields: { half: pores },
    }),
  ],
};

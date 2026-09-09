import * as veilLook from "../../../../../packages/render/src/veil-look.js";
import { patch, type Variant } from "../../../variant.js";
import { anvil } from "./paint.js";

/**
 * `creature:veil` / `anvil` — the cloud is a mass of heaps that turns, instead
 * of a contour with a gradient down it.
 *
 * The shipped thunderhead is a good picture and a **flat** one, and it is flat
 * in the exact way `docs/style-guide.md`'s Depth section names: its whole
 * interior is one vertical ramp laid out in picture coordinates, so every point
 * inside the outline is decided by how far down the screen it is. The contour
 * wobbles, the body sinks and settles, the bolts fork on the beat — and none of
 * that is the *inside* of the cloud, which does not move at all.
 *
 * ANVIL keeps the outline to the pixel and rebuilds what is under it: nine
 * heaps pinned at longitudes and latitudes on a mass that comes all the way
 * round every six beats, each shaded by its own normal against the fixed key,
 * each breathing on its own phase. The near heaps ride up over the far ones'
 * shoulders and go away again — which on a body that is *mostly interior* is
 * where the depth of the picture has to come from, because the silhouette is
 * spoken for.
 *
 * **It turns on the beat and not on the wall clock**, which is deliberate on
 * this creature above all others: the pair is already counting beats to the
 * morph, and weather that boils on that same count is a second reading of the
 * clock they are keeping rather than a competing one.
 *
 * **It has to work twice.** The two seats see different clouds — player 1
 * through it at 0.66 alpha with the body inside, player 2 opaque with nothing
 * — and the alpha is the shipped one, applied once over the whole mass, so
 * neither half is being quietly re-tuned. A candidate that looked good opaque
 * and turned to soup at 0.66 has failed the disguise, which is the only job
 * this cloud has.
 *
 * How it can lose. **A cloud that boils may say the wrong thing about time.**
 * This creature is a clock — the morph lands every `veilMorphBeats` and the
 * lightning marks it — and a churning interior gives a pair a second thing that
 * *looks* periodic to read a count off, one that is on a different period from
 * the one that matters. The second way is at the far end: nine soft heaps under
 * a see-through cloud could mottle the body underneath enough that player 1
 * hesitates over the colour, and a pilot who hesitates over the colour is the
 * whole encounter failing. If either happens, the answer is the shipped ramp.
 */
export const VEIL_ANVIL: Variant = {
  slot: "creature:veil",
  name: "anvil",
  sentence:
    "nine lit heaps standing on a mass that turns once every six beats, inside the same outline — the near ones ride up over the far ones and go away again, where the shipped cloud is one gradient down the picture",
  dir: "tools/versus/candidates/creature-veil/anvil",
  patches: [
    patch({
      target: veilLook.VEIL_LOOK,
      // No accessor: `drawVeilCloud` reads the export itself. The module
      // namespace is the whole route there is.
      reached: () => veilLook.VEIL_LOOK,
      where: {
        file: "packages/render/src/veil-look.ts",
        symbol: "VEIL_LOOK",
        type: "VeilLook",
      },
      fields: { mass: anvil },
    }),
  ],
};

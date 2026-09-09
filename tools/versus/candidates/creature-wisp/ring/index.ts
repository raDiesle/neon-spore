import * as wispLook from "../../../../../packages/render/src/wisp-look.js";
import { patch, type Variant } from "../../../variant.js";
import { ring } from "./paint.js";

/**
 * `creature:wisp` / `ring` — the streamers hang round the hem instead of across
 * it, so half of them are behind the bell.
 *
 * A wisp is a jellyfish: a bell full of holes with five streamers under it. The
 * bell earns every word `wisp-body.ts` spends on it — it has an axis, it
 * gathers before it goes, it is received in bands rather than filled. The
 * fringe under it is rooted at `k * rx * 0.32`, which is **five positions in a
 * row across the front of the body**. That is a comb, and a comb has no far
 * side: at any instant every strand this creature owns is between the pair and
 * the bell, and the one thing a jellyfish's tentacles do that a comb's teeth do
 * not is *go round the back*.
 *
 * RING roots eight strands at fixed longitudes on the hem circle and places
 * them with the projection every other surface in this repository uses. A
 * strand's root is `sin α` across, its weight and its brightness come off
 * `cos α`, and the ones on the far side are drawn behind the dome — which
 * costs nothing, because this whole pass is already painted before the bell
 * is. And **which two strands are the thick near pair changes as the bell
 * turns**, where the shipped fringe's middle two are the same two forever.
 *
 * The jump is untouched. The gather, the trail against the heading, the splash
 * on the landing and each strand's own share of the signal are the shipped
 * numbers, and `strandWave` is *called* rather than re-typed, so the two sides
 * of a pair flicker identically and the only thing that can differ between
 * them is where a strand is. Nothing about the rule moves either: a wisp is
 * still the one body only player two is shown, still standing rather than
 * falling, still answered by either trigger.
 *
 * **The turn is slow on purpose.** Seven seconds a revolution, on the one
 * creature in this game that does not fall and is therefore on screen for the
 * length of a wave. A fringe that spun fast enough to strobe would be a body
 * arguing with the number somebody is saying out loud.
 *
 * How it can lose, and it is a specific thing to watch for. **The bell is full
 * of holes, and a strand behind it is visible through them.** `wisp-static.ts`
 * takes bands out of the dome on every frame, so a far strand does not
 * cleanly disappear — it shows through the gaps, in fragments, and if that
 * reads as *litter inside the body* rather than as *a tentacle behind it*, the
 * candidate has made the one creature whose whole picture is unreliability
 * harder to name rather than rounder. The second way is plainer: eight is
 * three more strands than five, on a body that has to be told apart from
 * THE GHOST at 26 px.
 */
export const WISP_RING: Variant = {
  slot: "creature:wisp",
  name: "ring",
  sentence:
    "eight streamers rooted round the hem of the bell rather than five in a row across it — half of them are behind the body, and which two are nearest changes as it turns",
  dir: "tools/versus/candidates/creature-wisp/ring",
  patches: [
    patch({
      target: wispLook.WISP_LOOK,
      // No accessor: `drawWispBody` reads the export itself. The module
      // namespace is the whole route there is.
      reached: () => wispLook.WISP_LOOK,
      where: {
        file: "packages/render/src/wisp-look.ts",
        symbol: "WISP_LOOK",
        type: "WispLook",
      },
      fields: { fringe: ring },
    }),
  ],
};

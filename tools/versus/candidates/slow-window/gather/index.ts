import * as look from "../../../../../packages/render/src/slow-look.js";
import { patch, type Variant } from "../../../variant.js";
import { gatheringLight } from "./paint.js";

/**
 * GATHER — light falls toward the thing being answered.
 *
 * The owner's brief of 22 September 2026 drawn whole: soft motes drift inward
 * along their own rays toward one almost stationary target, the target keeps a
 * wide diffuse bloom that tightens as they arrive, and the screen's corners
 * sink a fifth to a third. Nothing in it has an edge — every layer is a
 * borderless radial gradient, and the file contains no stroke and no path.
 *
 * Against `frame`, `drain` and `gutter`, which each draw a measured thing
 * somewhere on the layout: this one draws nothing measurable at all, and what
 * it says is *where*, not *how long*. Against `wash`, which sinks the far half
 * of the field: the same quietness spent as light arriving rather than as
 * contrast leaving. Against `hush` and `indraw`, which are this brief with the
 * motes taken out and with the motes joined into streams: what the three
 * differ by is whether the suction reads as grain, as flow, or as nothing
 * moving at all.
 *
 * It is also the first candidate in the slot whose look **ends** — four tenths
 * of a second of fade at each end, spent inside the window, so it is at
 * nothing on the beat the game comes back up to speed rather than at its
 * loudest (`paint.ts`).
 */
export const SLOW_GATHER: Variant = {
  slot: "slow:window",
  name: "gather",
  sentence:
    "gather — soft motes drift in toward the mark the pair are answering and the screen's corners sink, all of it fading up and away over four tenths of a second so the window opens and shuts on nothing",
  dir: "tools/versus/candidates/slow-window/gather",
  patches: [
    patch({
      target: look.SLOW_LOOK,
      reached: () => look.SLOW_LOOK,
      where: {
        file: "packages/render/src/slow-look.ts",
        symbol: "SLOW_LOOK",
        type: "SlowLook",
      },
      fields: { paint: gatheringLight },
    }),
  ],
};

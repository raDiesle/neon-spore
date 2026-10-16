import * as look from "../../../../../packages/render/src/pod-look.js";
import { patch, type Variant } from "../../../variant.js";
import { drawSeed, type Moored, seedAt } from "../seed.js";

/**
 * **The pod as a tumbling seed** — THE SMART's seven studs on a round body,
 * taken off the flat card and put on a sphere. The sphere tumbles about a
 * tilted axis: studs ride over the limb and stand out of the outline as spikes,
 * then sink round the back and are gone, and a seam round its middle turns
 * with it so the roll is never ambiguous.
 *
 * From `WAKES_AT` beats left it tumbles faster and the studs throw themselves
 * out on every beat — a seed about to split. The body is `../seed.ts`, which
 * the rest of the slot draws too: the owner chose this one as the basis on
 * 16 October 2026, and its family adds to it rather than redraws it.
 */
export const smartPod: Moored = (ctx, l, x, y, t, beatsLeft) => {
  drawSeed(ctx, seedAt(l, x, y, t, beatsLeft));
};

export const POD_REAL_SMART: Variant = {
  slot: "pod:real",
  name: "smart",
  sentence:
    "a lit seed tumbling in depth — THE SMART's seven studs on a sphere, rising over the edge and sinking behind — that wakes and throws its studs on the beat as the clock runs out",
  dir: "tools/versus/candidates/pod-real/smart",
  patches: [
    patch({
      target: look.POD_LOOK,
      reached: () => look.POD_LOOK,
      where: { file: "packages/render/src/pod-look.ts", symbol: "POD_LOOK", type: "PodLook" },
      fields: { moored: smartPod },
    }),
  ],
};

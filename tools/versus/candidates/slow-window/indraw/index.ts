import * as look from "../../../../../packages/render/src/slow-look.js";
import { patch, type Variant } from "../../../variant.js";
import { indrawnStreams } from "./paint.js";

/**
 * INDRAW — the room drains toward the thing being answered.
 *
 * The owner's suction spent as flow rather than as grain: six soft streams
 * bend inward toward one almost stationary target, each a chain of overlapping
 * bokeh on a curve, fattest at the field's rim and thinning as it nears. No
 * line is drawn anywhere in it — a stream is sampled gradients, never a
 * stroke — and there is no vignette, because the streams carry the ground's
 * own colour with them at the rim and that is what makes the edge go quiet.
 *
 * Against `gather`, which is the same brief as eighteen separate motes, and
 * `hush`, which takes the moving part out altogether: the three are one brief
 * drawn three ways, and what they differ by is whether the suction reads as
 * grain, as flow, or as nothing moving at all.
 *
 * Its risk is that a stream is very close to a streak, and a streak is the one
 * shape the brief rules out.
 */
export const SLOW_INDRAW: Variant = {
  slot: "slow:window",
  name: "indraw",
  sentence:
    "indraw — six soft streams of light bend inward toward the mark the pair are answering, thinning as they near it, and the rim of the screen goes quiet because the light there is leaving",
  dir: "tools/versus/candidates/slow-window/indraw",
  patches: [
    patch({
      target: look.SLOW_LOOK,
      reached: () => look.SLOW_LOOK,
      where: {
        file: "packages/render/src/slow-look.ts",
        symbol: "SLOW_LOOK",
        type: "SlowLook",
      },
      fields: { paint: indrawnStreams },
    }),
  ],
};

import { EVENT_CADENCE_SECONDS, fresh, type Pose, run, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * A box and a dart standing together — two of the bodies whose only interior
 * is the two cores every blob without one of its own draws (`body-interior.ts`'s
 * `BODY_LOOK`).
 *
 * `creature:body-interior` is judged here. That record is also the interior
 * of a count and a throb, and neither is on this pose because neither shows
 * it: the count's socket and the throb's far half are both drawn over the
 * middle of the body, so the two cores under them are the same pixels
 * whatever they do (checked 27 September 2026, shipped against candidate).
 * The dart is on an even column because it only ever moves two at a time,
 * and the box on an odd one, so the dart's run cannot land on it.
 */
export const CORES_POSE: Pose = {
  name: "BODIES · THE TWO CORES",
  note: "A box and a dart falling a few columns apart. Each has the same two small dots inside it, just below the middle, and that pair is the whole of what is inside either body.",
  lookAt:
    "the two dots inside each body — whether they read as something alive in there or as two holes",
  crop: "field",
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  build: () => {
    const w = fresh([
      { beat: 0, col: 3, kind: "beatbox", color: null, beats: 3 },
      { beat: 0, col: 6, kind: "dart", color: "red" },
    ]);
    run(w, TPB * 3);
    return w;
  },
};

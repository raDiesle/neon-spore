import * as knob from "../../../../../packages/render/src/pull-knob.js";
import * as track from "../../../../../packages/render/src/pull-track.js";
import { patch, type Variant } from "../../../variant.js";
import { oozeKnob } from "./knob.js";
import { oozeTrack } from "./track.js";

/**
 * **OOZE** — SLIME made clear, from the owner's notes on the four pull looks
 * (10 October 2026): SLIME's drop and neck; COMET's lights coming on one
 * after another and green behind the hand; BEACON's ghost running the pull
 * and its ring of how far, here hugging the drop's own rim; TENDON's call to
 * start, louder; a hollow drop at the end as the place it goes; a pop with no
 * word in it when counted; and a refusal shown where the drop was let go,
 * off the path if the hand took it there, before it is hauled slowly home.
 */
export const PULL_OOZE: Variant = {
  slot: "pull:handle",
  name: "ooze",
  sentence:
    "SLIME made clear — waiting, ripples call the thumb, a ghost drop runs the pull lighting the drops one after another, and a hollow drop waits at the end; held, the drops passed go green and a ring round the drop fills; counted, the place goes green and the drop pops; refused, it bursts red where it was let go and is hauled slowly home",
  dir: "tools/versus/candidates/pull-handle/ooze",
  patches: [
    patch({
      target: knob.PULL_KNOB,
      reached: () => knob.PULL_KNOB,
      where: { file: "packages/render/src/pull-knob.ts", symbol: "PULL_KNOB" },
      fields: { paint: oozeKnob },
    }),
    patch({
      target: track.PULL_TRACK,
      reached: () => track.PULL_TRACK,
      where: { file: "packages/render/src/pull-track.ts", symbol: "PULL_TRACK" },
      fields: { paint: oozeTrack },
    }),
  ],
};

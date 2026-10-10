import * as knob from "../../../../../packages/render/src/pull-knob.js";
import * as track from "../../../../../packages/render/src/pull-track.js";
import { patch, type Variant } from "../../../variant.js";
import { slimeKnob, slimeTrack } from "./paint.js";

export const PULL_SLIME: Variant = {
  slot: "pull:handle",
  name: "slime",
  sentence:
    "the pull is a drop of goo — waiting, it wobbles in its puddle leaning the way to go, a trail of drops ahead; held, a sticky neck stretches back to the puddle; full, the neck snaps, droplets fly and the drop glows green",
  dir: "tools/versus/candidates/pull-handle/slime",
  patches: [
    patch({
      target: knob.PULL_KNOB,
      reached: () => knob.PULL_KNOB,
      where: { file: "packages/render/src/pull-knob.ts", symbol: "PULL_KNOB" },
      fields: { paint: slimeKnob },
    }),
    patch({
      target: track.PULL_TRACK,
      reached: () => track.PULL_TRACK,
      where: { file: "packages/render/src/pull-track.ts", symbol: "PULL_TRACK" },
      fields: { paint: slimeTrack },
    }),
  ],
};

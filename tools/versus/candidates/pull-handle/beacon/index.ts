import * as knob from "../../../../../packages/render/src/pull-knob.js";
import * as track from "../../../../../packages/render/src/pull-track.js";
import { patch, type Variant } from "../../../variant.js";
import { beaconKnob, beaconTrack } from "./paint.js";

export const PULL_BEACON: Variant = {
  slot: "pull:handle",
  name: "beacon",
  sentence:
    "the pull plays itself until a thumb takes it — a ghost knob slides to a socket at the far end; held, a ring round the knob fills; full, the socket closes green and rings out",
  dir: "tools/versus/candidates/pull-handle/beacon",
  patches: [
    patch({
      target: knob.PULL_KNOB,
      reached: () => knob.PULL_KNOB,
      where: { file: "packages/render/src/pull-knob.ts", symbol: "PULL_KNOB" },
      fields: { paint: beaconKnob },
    }),
    patch({
      target: track.PULL_TRACK,
      reached: () => track.PULL_TRACK,
      where: { file: "packages/render/src/pull-track.ts", symbol: "PULL_TRACK" },
      fields: { paint: beaconTrack },
    }),
  ],
};

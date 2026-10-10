import * as knob from "../../../../../packages/render/src/pull-knob.js";
import * as track from "../../../../../packages/render/src/pull-track.js";
import { patch, type Variant } from "../../../variant.js";
import { cometKnob, cometTrack } from "./paint.js";

export const PULL_COMET: Variant = {
  slot: "pull:handle",
  name: "comet",
  sentence:
    "the channel is a runway of lights and the knob a burning core — waiting, a crest of light runs to the end; held, each bead passed pops green behind a tail of fire; full, the end star flares and a shockwave rolls out",
  dir: "tools/versus/candidates/pull-handle/comet",
  patches: [
    patch({
      target: knob.PULL_KNOB,
      reached: () => knob.PULL_KNOB,
      where: { file: "packages/render/src/pull-knob.ts", symbol: "PULL_KNOB" },
      fields: { paint: cometKnob },
    }),
    patch({
      target: track.PULL_TRACK,
      reached: () => track.PULL_TRACK,
      where: { file: "packages/render/src/pull-track.ts", symbol: "PULL_TRACK" },
      fields: { paint: cometTrack },
    }),
  ],
};

import * as knob from "../../../../../packages/render/src/pull-knob.js";
import * as track from "../../../../../packages/render/src/pull-track.js";
import { patch, type Variant } from "../../../variant.js";
import { tendonKnob, tendonTrack } from "./paint.js";

export const PULL_TENDON: Variant = {
  slot: "pull:handle",
  name: "tendon",
  sentence:
    "THE WARDEN's rope as every pull's look — the knob a lit ball on a bolt, a dashed guide flowing to an open clamp; held, a braided cord stretches thinner and hotter; full, the clamp shuts and the cord burns green",
  dir: "tools/versus/candidates/pull-handle/tendon",
  patches: [
    patch({
      target: knob.PULL_KNOB,
      reached: () => knob.PULL_KNOB,
      where: { file: "packages/render/src/pull-knob.ts", symbol: "PULL_KNOB" },
      fields: { paint: tendonKnob },
    }),
    patch({
      target: track.PULL_TRACK,
      reached: () => track.PULL_TRACK,
      where: { file: "packages/render/src/pull-track.ts", symbol: "PULL_TRACK" },
      fields: { paint: tendonTrack },
    }),
  ],
};

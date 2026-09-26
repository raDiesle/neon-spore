import * as look from "../../../../../packages/render/src/slow-look.js";
import { patch, type Variant } from "../../../variant.js";
import { horizonWindow } from "./paint.js";

/**
 * HORIZON — offered 26 September 2026, when the owner took PRISM on top of the
 * streams and asked for the streams to be argued again as light *slowing*
 * round the boss. Every answer in `slow:light` keeps the prism and the fuse
 * and replaces the streams (`../window.ts`).
 */
export const SLOW_HORIZON: Variant = {
  slot: "slow:light",
  name: "horizon",
  sentence:
    "horizon — three rings of light circle the boss; on every slowed downbeat they are flung round it as long cold arcs, and across the beat they brake to points and warm to red, the ring nearest the boss slowing first",
  dir: "tools/versus/candidates/slow-light/horizon",
  patches: [
    patch({
      target: look.SLOW_LOOK,
      reached: () => look.SLOW_LOOK,
      where: {
        file: "packages/render/src/slow-look.ts",
        symbol: "SLOW_LOOK",
        type: "SlowLook",
      },
      fields: { paint: horizonWindow },
    }),
  ],
};

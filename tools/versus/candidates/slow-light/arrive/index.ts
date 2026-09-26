import * as look from "../../../../../packages/render/src/slow-look.js";
import { patch, type Variant } from "../../../variant.js";
import { arriveWindow } from "./paint.js";

/**
 * ARRIVE — offered 26 September 2026, when the owner took PRISM on top of the
 * streams and asked for the streams to be argued again as light *slowing*
 * round the boss. Every answer in `slow:light` keeps the prism and the fuse
 * and replaces the streams (`../window.ts`).
 */
export const SLOW_ARRIVE: Variant = {
  slot: "slow:light",
  name: "arrive",
  sentence:
    "arrive — a warp jump run backwards: on every slowed downbeat the light round the boss is streaked out from its skin like stars at light speed, and each streak shrinks, fast and then slower, into a still point at its far end",
  dir: "tools/versus/candidates/slow-light/arrive",
  patches: [
    patch({
      target: look.SLOW_LOOK,
      reached: () => look.SLOW_LOOK,
      where: {
        file: "packages/render/src/slow-look.ts",
        symbol: "SLOW_LOOK",
        type: "SlowLook",
      },
      fields: { paint: arriveWindow },
    }),
  ],
};

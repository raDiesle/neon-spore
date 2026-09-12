import * as look from "../../../../../packages/render/src/countdown-look.js";
import { patch, type Variant } from "../../../variant.js";
import { irisCount, irisOver } from "./paint.js";

/**
 * `creature:countdown` / `iris` — a socket with a bright core, and blades of
 * the body closed over it, one per beat left; on zero the hole is open.
 *
 * **What the shipped side is.** Notches in the rim for the beats left and a
 * halo on zero. The count is legible; what the count is *for* is not on the
 * body anywhere.
 *
 * **What this argues.** That the picture should say the rule. The body can
 * only be hit on zero, so on zero there is a hole with a core at the bottom
 * of it and a shot visibly has somewhere to go; while it is closed, what is
 * in the way is the body's own flesh, in blades fanned from twelve — four,
 * three, two, one — and the last blade standing slides back into the rim
 * through its beat, so the pilot sees the next one coming. The socket and
 * the core are on both screens and never move; the navigator sees an eye that
 * does not blink.
 *
 * **How it can lose.** *Blades on a thirteen-pixel socket are a pinwheel.* At
 * true size four wedges may read as one lumpy dot, and the count then has to
 * be taken off the sliding blade alone. `bun run versus:shot` at true size is
 * the check.
 */
export const COUNTDOWN_IRIS: Variant = {
  slot: "creature:countdown",
  name: "iris",
  sentence:
    "a socket with a bright core, both screens; on the pilot's, blades of the body closed over it, one per beat left, the last one sliding back through its beat — and on zero a hole to shoot into",
  dir: "tools/versus/candidates/creature-countdown/iris",
  patches: [
    patch({
      target: look.COUNTDOWN_LOOK,
      reached: () => look.COUNTDOWN_LOOK,
      where: {
        file: "packages/render/src/countdown-look.ts",
        symbol: "COUNTDOWN_LOOK",
        type: "CountdownLook",
      },
      fields: { over: irisOver, count: irisCount },
    }),
  ],
};

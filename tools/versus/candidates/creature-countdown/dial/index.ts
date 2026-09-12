import * as look from "../../../../../packages/render/src/countdown-look.js";
import { patch, type Variant } from "../../../variant.js";
import { dialCount, dialOver } from "./paint.js";

/**
 * `creature:countdown` / `dial` — the disc is a clock face; the count is a lit
 * sector draining clockwise with a hand on its edge.
 *
 * **What the shipped side is.** Four notches cut into the rim on the pilot's
 * screen, one gone per beat, and a halo on zero. Three pixels of dark on a
 * pink edge at 26 px: it can be read, and it has to be looked for.
 *
 * **What this argues.** That the count should be the body's whole face
 * rather than its edge. A dark face with a bezel on both screens; on the
 * pilot's a sector of the body colour for the beats left, ticks for the
 * beats, and a hand that sweeps through the running beat and lands on a
 * tick — so the sentence the pilot says is read off a clock rather than
 * counted off notches, and *how soon* is on the face as well as *how many*.
 * On zero the face fills with light under the shipped halo.
 *
 * **How it can lose.** *It is a pie timer, and pie timers are furniture.*
 * A face on a creature can read as a HUD element stuck to a body rather than
 * as the body's own organ, and the sweep may draw the eye every frame on a
 * field two people are reading.
 */
export const COUNTDOWN_DIAL: Variant = {
  slot: "creature:countdown",
  name: "dial",
  sentence:
    "a dark clock face on the disc, both screens; on the pilot's a lit sector for the beats left with a hand sweeping down to each tick — and the whole face alight on zero",
  dir: "tools/versus/candidates/creature-countdown/dial",
  patches: [
    patch({
      target: look.COUNTDOWN_LOOK,
      reached: () => look.COUNTDOWN_LOOK,
      where: {
        file: "packages/render/src/countdown-look.ts",
        symbol: "COUNTDOWN_LOOK",
        type: "CountdownLook",
      },
      fields: { over: dialOver, count: dialCount },
    }),
  ],
};

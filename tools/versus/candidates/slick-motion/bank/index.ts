import * as motions from "../../../../../packages/content/src/motions-event.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `slick:motion` / `bank` — it points where it is going.
 *
 * **This is the half of the owner's sentence FLOAT does not answer.** He asked
 * on 9 September 2026 for a slick that floats in all directions "but some more
 * according to flying position": not only drifting, but *oriented* by the
 * drift. So the body's roll is not a clock of its own here — it is read off the
 * drift's own velocity, and the squash is read off its speed.
 *
 * **The velocity is differentiated rather than guessed.** `poseAt` is a pure
 * function of the beat, so the derivative of the drift is available in closed
 * form: the same two sines, differentiated, give the direction the body is
 * travelling on this frame. The roll is that direction's angle, damped, and the
 * stretch is along it — a body moving fast is drawn slightly long in the
 * direction it is moving and narrow across it, which is what a thing swimming
 * through something looks like.
 *
 * **Nothing about it depends on where the body is on the field**, and it
 * cannot: an own-motion is handed a beat and nothing else, which is what makes
 * two phones draw the same creature the same way. "Flying position" is answered
 * as *attitude* — the way the body is held as it goes — rather than as a
 * position on the screen, and that is the honest reading of it.
 *
 * **How it can lose.** *A body that points is a body that is aiming.* THE DART
 * is the creature whose whole character is having a direction, and a slick that
 * leans into its travel is spending the difference between the two.
 */

const WIDE = 0.15;
const TALL = 0.1;
const ACROSS = 0.317;
const DOWN = 0.211;
/** How much of the travel's angle the body takes, and how far it stretches.
 *
 * A fifth, and the first cut took a half. `own-motion.ts` says why in its own
 * words: a body rotated past a quarter turn swings sideways and then over
 * itself, which reads as tumbling rather than as floating. At a half this
 * candidate photographed standing on end — a slick is a horizontal body, and a
 * vertical one is a different creature. A fifth is a lean you can see and not a
 * body that has turned. */
const BANK = 0.2;
const STRETCH = 0.09;
/** The speed the stretch is measured against, so it saturates rather than grows. */
const FULL = 0.3;

export const SLICK_BANK: Variant = {
  slot: "slick:motion",
  name: "bank",
  sentence: "the same drift — the body leans into its own travel and stretches along it",
  dir: "tools/versus/candidates/slick-motion/bank",
  patches: [
    patch({
      target: motions.SWALLOW,
      reached: () => motions.SWALLOW,
      where: {
        file: "packages/content/src/motions-event.ts",
        symbol: "SWALLOW",
        type: "OwnMotion",
      },
      fields: {
        poseAt(t) {
          const a = t * ACROSS * Math.PI * 2;
          const b = t * DOWN * Math.PI * 2 + 1.1;
          const dx = Math.sin(a) * WIDE;
          const dy = Math.sin(b) * TALL;
          // The drift's own derivative — the direction it is travelling now.
          const vx = Math.cos(a) * WIDE * ACROSS;
          const vy = Math.cos(b) * TALL * DOWN;
          const speed = Math.hypot(vx, vy);
          const lean = Math.atan2(vy, vx) * BANK;
          const pull = Math.min(1, speed / (FULL * ACROSS)) * STRETCH;
          return { dx, dy, rot: lean, sx: 1 + pull, sy: 1 / (1 + pull) };
        },
      },
    }),
  ],
};

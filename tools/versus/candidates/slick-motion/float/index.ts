import * as motions from "../../../../../packages/content/src/motions-event.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `slick:motion` / `float` — adrift in every direction at once.
 *
 * **What the shipped side is.** SWALLOW: one sac fills, the mass crosses the
 * waist over 1.2 beats, the other holds it, and then 1.8 beats of nothing. It
 * is a good motion and it is a *sideways* one — everything it does happens
 * along the body's long axis, and the body never leaves the line it is on.
 *
 * **What this argues.** The owner asked on 9 September 2026 for a slick that is
 * "very fluid, floating in all directions". This is that, in its plainest
 * form: two slow drifts on periods that share no common multiple, so the body
 * traces a path that never visibly repeats, with a lazy roll and a breathing
 * squash under it. Nothing here is an event — where SWALLOW has a move and a
 * wait, this has neither, and that is the argument.
 *
 * **It stays inside its lane, which is not a detail.** Spec 5.8 holds an
 * own-motion to a quarter of a tile; a creature that wandered out of its column
 * would break the one thing the whole control scheme rests on, which is that a
 * body is *in* a column the pair can name. The excursions here are a sixth of a
 * tile across and an eighth down, and `variants.test.ts` holds every `poseAt`
 * patch to that limit.
 *
 * **How it can lose.** *Nothing happens.* A motion with no event in it gives
 * the pair nothing to say to each other, and SWALLOW's rest is what makes its
 * crossing legible. A body that is always moving may be a body whose movement
 * stops meaning anything.
 */

/** Two drifts, in tiles, on periods with no common multiple. */
const WIDE = 0.16;
const TALL = 0.11;
const ACROSS = 0.317;
const DOWN = 0.211;
/** A lazy roll, and how far the body breathes as it goes. */
const ROLL = 0.13;
const ROLL_RATE = 0.139;
const BREATH = 0.045;
const BREATH_RATE = 0.263;

export const SLICK_FLOAT: Variant = {
  slot: "slick:motion",
  name: "float",
  sentence:
    "two slow drifts that never come back into step — adrift in every direction, with no event in it at all",
  dir: "tools/versus/candidates/slick-motion/float",
  patches: [
    patch({
      target: motions.SWALLOW,
      // `livingMotion("slick")` is the route the drawing code takes and it
      // hands back this record itself (`content/living-look.ts`).
      reached: () => motions.SWALLOW,
      where: {
        file: "packages/content/src/motions-event.ts",
        symbol: "SWALLOW",
        type: "OwnMotion",
      },
      fields: {
        poseAt(t) {
          const breath = Math.sin(t * BREATH_RATE * Math.PI * 2);
          return {
            dx: Math.sin(t * ACROSS * Math.PI * 2) * WIDE,
            dy: Math.sin(t * DOWN * Math.PI * 2 + 1.1) * TALL,
            rot: Math.sin(t * ROLL_RATE * Math.PI * 2) * ROLL,
            sx: 1 + breath * BREATH,
            sy: 1 - breath * BREATH,
          };
        },
      },
    }),
  ],
};

import * as motions from "../../../../../packages/content/src/motions-event.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `slick:motion` / `glide` — a push, a coast, and a new direction.
 *
 * **What this argues.** That a thing swimming does not oscillate. FLOAT and
 * BANK are both continuous — the body is always moving and always has been —
 * and a swimmer is not: it pushes, it coasts while the push runs out, and then
 * it pushes somewhere else. That is a *move and a wait*, which is the shape the
 * shipped SWALLOW has and the other two candidates give up. This keeps it and
 * changes what the move is: a stroke in a direction instead of a transfer along
 * the axis.
 *
 * **The direction turns by a fixed angle each stroke**, not by a random one —
 * an own-motion is a pure function of the beat and there is nowhere for a
 * random number to come from, which is the rule that makes two phones draw one
 * creature alike. A turn of about 2.4 radians per stroke never repeats a
 * heading for a long time, so the path reads as wandering without anything
 * being wandering underneath it.
 *
 * **The body stretches on the push and recovers on the coast**, area held, so
 * the stroke is legible as effort rather than as a size change — a body that
 * grew would be filling, and filling is a size tell (`docs/alive.md`).
 *
 * **How it can lose.** *It is the busiest of the three.* A stroke every two
 * beats on every slick in a column is a lot of movement on a screen where the
 * pair is trying to read positions, and the wave that shows it is not a wave
 * with one body on it.
 */

/** How long a stroke and its coast take, in beats, and how far the push carries. */
const STROKE = 2.1;
const PUSH = 0.55;
const REACH = 0.15;
/** How far the heading turns each stroke, in radians — never back to where it was. */
const TURN = 2.4;
const STRETCH = 0.1;

export const SLICK_GLIDE: Variant = {
  slot: "slick:motion",
  name: "glide",
  sentence:
    "a stroke, a coast while it runs out, and a new heading — a swimmer rather than an oscillation",
  dir: "tools/versus/candidates/slick-motion/glide",
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
          const stroke = Math.floor(t / STROKE);
          const p = (t - stroke * STROKE) / STROKE;
          // Quick to leave and slow to arrive, then held: the coast is the part
          // of the cycle where nothing is being done.
          const v = Math.min(1, p / PUSH);
          const e = 1 - (1 - v) ** 3;
          // Where it was, and where this stroke is taking it. Both headings are
          // the same arithmetic one stroke apart, so the body arrives where the
          // next stroke starts and the path has no jump in it.
          const was = stroke * TURN;
          const now = was + TURN;
          const dx = (Math.cos(was) + (Math.cos(now) - Math.cos(was)) * e) * REACH;
          const dy = (Math.sin(was) + (Math.sin(now) - Math.sin(was)) * e) * REACH * 0.7;
          // Peaks in the middle of the push and is nothing during the coast.
          const effort = 4 * e * (1 - e);
          const w = 1 + effort * STRETCH;
          return { dx, dy, rot: Math.cos(now) * 0.12 * effort, sx: w, sy: 1 / w };
        },
      },
    }),
  ],
};

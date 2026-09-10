import type { OwnMotion } from "@neon-spore/content";
import { pose } from "./pose.js";

/**
 * Motions offered against a body that ships, and left unspent.
 *
 * A third kind beside `plane.ts`'s unspent drafts and the two retired ones at
 * the end of `index.ts`. These were VERSUS candidates — a second answer to the
 * slick's own motion, drawn at 26 px beside SWALLOW on one clock — and the
 * owner answered the slot on 9 September 2026 by taking BANK and asking for
 * these two to be *kept as pictures* rather than adopted or thrown away. So
 * they come here, where a motion nothing carries can still be seen on a body,
 * exactly as `drafts/offered.ts` keeps a contour that was offered and not
 * taken. Each keeps its argument and its *how it can lose* paragraph, because
 * a moved motion with no note is a picture nobody can weigh.
 *
 * **Time is beats**, as everywhere `poseAt` is called; the periods below were
 * authored in beats to begin with.
 */

/** How long a stroke and its coast take, in beats, and how far the push carries. */
const STROKE = 2.1;
const PUSH = 0.55;
const REACH = 0.15;
/** How far the heading turns each stroke, in radians — never back to where it was. */
const TURN_PER_STROKE = 2.4;
const STRETCH = 0.1;

/**
 * GLIDE — a push, a coast, and a new direction.
 *
 * **What it argues.** That a thing swimming does not oscillate. FLOAT and BANK
 * are both continuous — the body is always moving and always has been — and a
 * swimmer is not: it pushes, it coasts while the push runs out, and then it
 * pushes somewhere else. That is a *move and a wait*, which is the shape the
 * shipped SWALLOW has and the other two gave up. This keeps it and changes what
 * the move is: a stroke in a direction instead of a transfer along the axis.
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
 * with one body on it. Offered as `slick:motion` / `glide` and left unspent
 * when BANK was taken.
 */
export const GLIDE: OwnMotion = {
  name: "GLIDE",
  note: "a stroke, a coast while it runs out, and a new heading — a swimmer rather than an oscillation",
  poseAt(t) {
    const stroke = Math.floor(t / STROKE);
    const p = (t - stroke * STROKE) / STROKE;
    // Quick to leave and slow to arrive, then held: the coast is the part of
    // the cycle where nothing is being done.
    const v = Math.min(1, p / PUSH);
    const e = 1 - (1 - v) ** 3;
    // Where it was, and where this stroke is taking it. Both headings are the
    // same arithmetic one stroke apart, so the body arrives where the next
    // stroke starts and the path has no jump in it.
    const was = stroke * TURN_PER_STROKE;
    const now = was + TURN_PER_STROKE;
    const dx = (Math.cos(was) + (Math.cos(now) - Math.cos(was)) * e) * REACH;
    const dy = (Math.sin(was) + (Math.sin(now) - Math.sin(was)) * e) * REACH * 0.7;
    // Peaks in the middle of the push and is nothing during the coast.
    const effort = 4 * e * (1 - e);
    const w = 1 + effort * STRETCH;
    return pose(dx, dy, Math.cos(now) * 0.12 * effort, w, 1 / w);
  },
};

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

/**
 * FLOAT — adrift in every direction at once.
 *
 * **What it argues.** The owner asked on 9 September 2026 for a slick that is
 * "very fluid, floating in all directions". This is that, in its plainest
 * form: two slow drifts on periods that share no common multiple, so the body
 * traces a path that never visibly repeats, with a lazy roll and a breathing
 * squash under it. Nothing here is an event — where SWALLOW has a move and a
 * wait, this has neither, and that is the argument. BANK is this drift with
 * the roll read off its own velocity, and BANK is what was taken.
 *
 * **It stays inside its lane, which is not a detail.** Spec 5.8 holds an
 * own-motion to a quarter of a tile; a creature that wandered out of its column
 * would break the one thing the whole control scheme rests on, which is that a
 * body is *in* a column the pair can name. The excursions here are a sixth of
 * a tile across and an eighth down.
 *
 * **How it can lose.** *Nothing happens.* A motion with no event in it gives
 * the pair nothing to say to each other, and SWALLOW's rest is what makes its
 * crossing legible. A body that is always moving may be a body whose movement
 * stops meaning anything. Offered as `slick:motion` / `float` and left unspent
 * when BANK was taken.
 */
export const FLOAT: OwnMotion = {
  name: "FLOAT",
  note: "two slow drifts that never come back into step — adrift in every direction, with no event in it",
  poseAt(t) {
    const breath = Math.sin(t * BREATH_RATE * Math.PI * 2);
    return pose(
      Math.sin(t * ACROSS * Math.PI * 2) * WIDE,
      Math.sin(t * DOWN * Math.PI * 2 + 1.1) * TALL,
      Math.sin(t * ROLL_RATE * Math.PI * 2) * ROLL,
      1 + breath * BREATH,
      1 - breath * BREATH,
    );
  },
};

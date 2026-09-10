import type { OwnMotion } from "./own-motion.js";

/**
 * THE SLICK: adrift in every direction, and pointing where it is going.
 *
 * The owner asked on 9 September 2026 for a slick that floats in all
 * directions "but some more according to flying position", and `slick:motion`
 * put three answers beside SWALLOW at 26 px. He took this one: not only
 * drifting, but *oriented* by the drift. Two slow drifts on periods that share
 * no common multiple, so the body traces a path that never visibly repeats;
 * the body's roll is not a clock of its own but is read off the drift's own
 * velocity, and the squash is read off its speed.
 *
 * **The velocity is differentiated rather than guessed.** `poseAt` is a pure
 * function of the beat, so the derivative of the drift is available in closed
 * form: the same two sines, differentiated, give the direction the body is
 * travelling on this frame. The roll is that direction's angle, damped, and
 * the stretch is along it — a body moving fast is drawn slightly long in the
 * direction it is moving and narrow across it, which is what a thing swimming
 * through something looks like.
 *
 * **Nothing about it depends on where the body is on the field**, and it
 * cannot: an own-motion is handed a beat and nothing else, which is what makes
 * two phones draw the same creature the same way. "Flying position" is
 * answered as *attitude* — the way the body is held as it goes — rather than
 * as a position on the screen, and that is the honest reading of it.
 *
 * **It stays inside its lane.** Spec 5.8 holds an own-motion to a quarter of a
 * tile, and a creature that wandered out of its column would break the one
 * thing the whole control scheme rests on, which is that a body is *in* a
 * column the pair can name. The excursions are a sixth of a tile across and a
 * tenth down; `own-motion.test.ts` holds every motion the game draws to that.
 *
 * What it replaced — SWALLOW, a transfer from one sac to the other and a wait
 * — is in `motions-retired.ts`, and the two answers he did not take, GLIDE
 * and FLOAT, are on the SHAPES tab beside it
 * (`tools/shape-sheet/src/motions/offered.ts`). This is a sine again, which
 * `motions-event.ts` argued against on the day SWALLOW arrived: a sine has no
 * rest for an event to stand against. What it has instead is a direction,
 * and the owner chose that over the rest.
 */

/** Two drifts, in tiles, on periods with no common multiple. */
const WIDE = 0.15;
const TALL = 0.1;
const ACROSS = 0.317;
const DOWN = 0.211;
/**
 * How much of the travel's angle the body takes, and how far it stretches.
 *
 * A fifth, and the first cut took a half. `own-motion.ts` says why in its own
 * words: a body rotated past a quarter turn swings sideways and then over
 * itself, which reads as tumbling rather than as floating. At a half this
 * photographed standing on end — a slick is a horizontal body, and a vertical
 * one is a different creature. A fifth is a lean you can see and not a body
 * that has turned.
 */
const BANK_LEAN = 0.2;
const STRETCH = 0.09;
/** The speed the stretch is measured against, so it saturates rather than grows. */
const FULL = 0.3;

export const BANK: OwnMotion = {
  name: "BANK",
  note: "two slow drifts that never come back into step — and the body leans into its own travel",
  poseAt(t) {
    const a = t * ACROSS * Math.PI * 2;
    const b = t * DOWN * Math.PI * 2 + 1.1;
    const dx = Math.sin(a) * WIDE;
    const dy = Math.sin(b) * TALL;
    // The drift's own derivative — the direction it is travelling now.
    const vx = Math.cos(a) * WIDE * ACROSS;
    const vy = Math.cos(b) * TALL * DOWN;
    const speed = Math.hypot(vx, vy);
    const lean = Math.atan2(vy, vx) * BANK_LEAN;
    const pull = Math.min(1, speed / (FULL * ACROSS)) * STRETCH;
    return { dx, dy, rot: lean, sx: 1 + pull, sy: 1 / (1 + pull) };
  },
};

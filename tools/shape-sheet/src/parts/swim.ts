import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { SWIM_ATTACK, SWIM_DEPTH, SWIM_PERIOD, SWIM_RELEASE, stroke } from "../motions/pulse.js";

/**
 * A swimming bell's contraction, as a function of time.
 *
 * **This is the one motion in the catalogue that a pose cannot say.** Every
 * spare motion in `motions/` is an affine transform of a whole body, and
 * `PERISTALSIS` already writes down what that costs: a pose does one thing to
 * everything at once. A jellyfish is the case where that is not a limitation
 * but the entire subject — the bell squeezes and the tentacles *do not*, they
 * stream a beat behind it, and a transform that scaled both together would
 * draw the one thing that makes a rendered jellyfish look wrong. So the
 * contraction lives in the contour, where the bell and what hangs off it can
 * disagree about what time it is.
 *
 * The envelope is `stroke` out of `motions/pulse.ts`, called rather than
 * copied: fast in and slow out is what separates a swim stroke from a bellows,
 * and that argument is made once, there.
 *
 * The clock is the game's beat, not a number chosen here. A page pulsing at a
 * tempo the field does not have would be answering a question about a look
 * nobody will ever see — `docs/skins.md` makes the same call for the same
 * reason. The envelope and its four numbers are `motions/pulse.ts`'s, shared
 * with `JET`, which is the pose half of the same stroke.
 */
export interface Pulse {
  /** Beats from one contraction to the next. */
  period?: number;
  /** Beats spent squeezing. */
  attack?: number;
  /** Beats spent letting go. */
  release?: number;
  /**
   * How far the bell squeezes. `rx` narrows by this fraction and `ry` deepens
   * by about two thirds of it, so the bell loses width faster than it gains
   * depth: a bell that held its area exactly would read as a balloon being
   * rolled rather than as something ejecting water.
   */
  depth?: number;
}

/**
 * **There is no phase here, and its absence is the design.**
 *
 * `own-motion.ts` spreads a field's bodies across the cycle so a wave does not
 * breathe as one object, and that is right for a field. A catalogue page is
 * the opposite case and `docs/skins.md` already argues it: a comparison needs
 * every card to change at once, or what you are reading is which cards
 * somebody clicked. Keeping the clock shared also makes the bell and `JET`
 * synchronous **by construction** rather than by two numbers agreeing — a
 * per-body phase here would immediately let a body bob against its own
 * squeeze, and nothing would catch it but an eye.
 */

/**
 * The contraction at `t` seconds, 0 relaxed and 1 fully squeezed, optionally
 * as it was `lag` beats ago.
 *
 * `lag` is the whole reason this takes an argument. A tentacle does not move
 * when the bell moves; it moves when the *water* does, which is later, and
 * later still at the tip than at the root. A part asks for the pulse at its
 * own delay and the trailing falls out of the geometry rather than being
 * animated on top of it.
 */
export function contraction(p: Pulse | undefined, t: number, lag = 0): number {
  if (!p) return 0;
  const beats = (t * DEFAULT_CONFIG.bpm) / 60 - lag;
  const period = p.period ?? SWIM_PERIOD;
  // A negative lag would walk off the bottom of the cycle; the modulo brings
  // it back rather than returning a rest the caller would read as "relaxed".
  const at = ((beats % period) + period) % period;
  return stroke(at, p.attack ?? SWIM_ATTACK, p.release ?? SWIM_RELEASE);
}

/** How far the bell squeezes, given how hard it is squeezing. */
export function squeeze(p: Pulse | undefined, c: number): { x: number; y: number } {
  const d = (p?.depth ?? SWIM_DEPTH) * c;
  return { x: 1 - d, y: 1 + d * 0.62 };
}

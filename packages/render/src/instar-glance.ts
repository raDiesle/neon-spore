import { glanceAt } from "./instar-glance-styles.js";
import { tailLeanAt } from "./instar-tail-lean.js";
import { bodyLife } from "./motion-life.js";

/**
 * **Where THE INSTAR's face-on head and resting tail are looking**, as two
 * records so VERSUS can offer a head that turns and a tail that wanders.
 * The owner, 9 October 2026: *the head of
 * boss just slightly changes angle because he moves head slightly to another
 * side so it is not so static. and the tail could switch to move from right
 * to middle and left*.
 *
 * The head glances (taken 9 October 2026): on top of the third-of-the-way
 * turn `instar-turn.ts` gives it, it goes COCK, SWAY, COCK, LOOK, a round
 * each (`instar-glance-styles.ts`), halved on a device asking for less
 * motion (`bodyLife`). The tail rests (taken 9 October 2026) in a round each
 * of STATIONS and PENDULUM in turn (`instar-tail-lean.ts`), halved the same
 * way, and wherever it leans it is kept on the screen (`instar-tail-fit.ts`).
 */

export interface Glance {
  /** How far the snout swings on top of its turn, in head radii, `time` seconds in: + toward the screen's right. */
  swing: (time: number) => number;
  /** How far the head rolls about its centre, radians: + clockwise. */
  roll: (time: number) => number;
}

export const INSTAR_GLANCE: Glance = {
  swing: (time) => glanceAt(time).swing * bodyLife(),
  roll: (time) => glanceAt(time).roll * bodyLife(),
};

export interface TailRest {
  /**
   * Which way the tail leans while it rests, -1..1: 1 up and to the right of
   * the rear, 0 straight up, -1 up and to the left. A lash takes it over
   * whatever it is (`f.tail`), so the fork is always over its marks. `time`
   * is the picture's clock, seconds.
   */
  lean: (time: number) => number;
}

export const INSTAR_TAIL_REST: TailRest = {
  lean: (time) => tailLeanAt(time) * bodyLife(),
};

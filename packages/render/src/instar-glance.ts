/**
 * **Where THE INSTAR's face-on head and resting tail are looking**, as two
 * records so VERSUS can offer a head that turns and a tail that wanders
 * (`instar:glance`, `instar:tail`). The owner, 9 October 2026: *the head of
 * boss just slightly changes angle because he moves head slightly to another
 * side so it is not so static. and the tail could switch to move from right
 * to middle and left*.
 *
 * Shipped, both are still: the head keeps the third-of-the-way turn
 * `instar-turn.ts` gives it, and the tail rests up and to the right of the
 * rear (`instar-tail.ts`).
 */

export interface Glance {
  /** How far the snout swings on top of its turn, in head radii, `time` seconds in: + toward the screen's right. */
  swing: (time: number) => number;
  /** How far the head rolls about its centre, radians: + clockwise. */
  roll: (time: number) => number;
}

export const INSTAR_GLANCE: Glance = {
  swing: () => 0,
  roll: () => 0,
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
  lean: () => 1,
};

import type { Color } from "./types.js";

/**
 * **What a hand did to a body**, as `SimEvent` arms: a hold landing, a push
 * spent, THE CAIRN pulled, shed and held,
 * and an armoured gate held open by a cord pulled taut.
 *
 * Cut out of `events.ts` on 17 October 2026, when that file stood one line
 * under its limit and the next event added anywhere would have turned
 * `limits.test.ts` red mid-lane. Only the union crosses into `SimEvent`.
 */
export type HandEvent =
  /**
   * A hand carried across THE CAIRN took a unit out of the pile, on the side
   * the finger went. `player` is the seat charged the column, and there is one
   * of these per hand that paid — two thumbs pulling the same way both earned
   * it, and `carry` next door already settles that question the same way.
   *
   * Its own event rather than `carry`: nothing moved a lane. What happened is
   * that a body stopped being part of a boss, and the rock standing in that
   * column a tick later is the same stone the pair has been looking at
   * (`sim/cairn.ts`).
   */
  | { type: "cairnPulled"; player: 1 | 2; col: number; row: number }
  /**
   * The pile ran out of patience and let one go itself, into the column it had
   * been announcing on player 1's screen. No `player`: this is the one thing in
   * the fight neither of them did, which is the whole of what it says.
   */
  | { type: "cairnShed"; col: number; row: number }
  /**
   * A hand rested on the pile and bought this beat off its clock
   * (`cairn-hold.ts`). One a beat while the hold lasts, not one at the start:
   * the seat that cannot see the settle mark hears the strain go on, and that
   * is the only way they know the pile is still being held.
   */
  | { type: "cairnHeld"; col: number; row: number }
  /** A hand took hold. Only the moment it lands — the hold itself is state,
   * not an event, and render/ reads it off the world every frame. */
  | { type: "grip"; player: 1 | 2; col: number; row: number }
  /**
   * THE PUSH: a held body spent a column and stepped it, on the beat. `player`
   * is the hand that spent it, and both are pushed when both hands pulled the
   * same way — two thumbs on one rock is a thing the pair may do, and each of
   * them has earned the sound. `dir` is which way it went.
   *
   * The hold is state and the carry is not, which is the same split `grip`
   * makes: what render/ reads off the world every frame is a hand on a body,
   * and this is the one moment it moved.
   */
  | { type: "carry"; player: 1 | 2; col: number; row: number; dir: -1 | 1 }
  /**
   * Something armoured came open under a hand and the thing behind it can be
   * shot: THE WARDEN's hatch, when the line comes fully taut, and THE LID's
   * plates, when the cord does. **One event for both**, because they are one
   * moment — a gate held open by somebody pulling, in the colour the shot has
   * to carry — and the ear has nothing to gain from telling them apart when
   * the eye already has (`lid.ts`, `warden.ts`).
   */
  | { type: "eyeOpen"; col: number; color: Color };

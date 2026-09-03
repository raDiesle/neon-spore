import { smoothstep } from "./ease.js";
/**
 * The cannon's wind-up, as pure arithmetic — no canvas anywhere near it.
 *
 * The owner's request was not a shape, it was a *slowness*: "the shot should
 * be pushed out somewhat slowly as it is expelled, so that you can see the
 * animation." A bulge with no effort in it is a circle in a different place,
 * so the three beats below are the thing that was asked for and
 * `cannon-maw.ts`'s drawing is only how they are shown. Pure arithmetic can
 * also be asserted, which is what `test/egg-curve.test.ts` does to the shape
 * of the curve rather than to the picture.
 *
 * **The three beats, and the third is the point.**
 *
 * 1. `strain` rises to 1 over the first 62% of the wind-up and nothing has
 *    left. It eases rather than ramps, because a linear swell reads as a
 *    meter filling; and it carries a tremor that dies the moment anything
 *    starts to move, because a body under load shakes and a body doing work
 *    does not.
 * 2. `crown` runs 0 → 1 over the last 38%, as `u ** 2.4` — the egg barely
 *    moves, then goes. That exponent is the difference between something being
 *    pushed and something being released; a linear crown reads as a lift
 *    animation.
 * 3. `relief` is what a first attempt leaves out, and it is the whole
 *    difference between *effort* and *a brighter flash*. The vent snaps shut
 *    (`exp(-9r)`, near enough closed inside a twentieth of a second — the pop),
 *    while the body subsides on a **damped oscillation that goes past rest**:
 *    `exp(-3r) cos(4.4r)` crosses zero at r ≈ 0.357 and reaches about −0.14 at
 *    r ≈ 0.55 before easing home. That undershoot is slack — the cloaca pulled
 *    *in* below its resting shape, spent — and a mouth that merely fades back
 *    to rest does not read as having done anything.
 *
 * **It is drawn over the timing the game already has and does not touch it.**
 * `phase` 0..1 is `chargeMilli / 1000` (`packages/sim`'s `LayState`), settled
 * to the tick on both devices; 1..2 is the renderer's own follow-through
 * (`LayEcho`, in `cannon-maw.ts`). Nothing here can move when a shot becomes
 * live, and nothing here changes `shotChargeBeats` — see the comment on it in
 * `apps/game/src/main.ts` for why the length of the wind-up is a separate
 * question from the shape of it.
 */

/** Where in the wind-up the egg starts to come through. */
export const CROWN_AT = 0.62;

/** The three beats, from the laying phase and the renderer's clock. */
export interface EggBeats {
  /** 0..1, the swelling while nothing has left. */
  strain: number;
  /** 0..1, how far the egg has come through. */
  crown: number;
  /** 0..1 through the follow-through, 0 before the shot has gone. */
  relief: number;
  /** How distended the body is: 0 at rest, ~0.9 at the departure, negative
   * while it is slack, and back to 0. */
  bulge: number;
  /** 0..1, how far the vent is open — widest at the departure, then snapped. */
  vent: number;
  /** A shiver under load, ±1, gone once anything is actually moving. */
  tremor: number;
}

/** How distended the body is at the moment the shot leaves. */
const AT_DEPARTURE = 0.9;

export function eggBeats(phase: number, time: number): EggBeats {
  const strain = phase <= 0 ? 0 : phase < CROWN_AT ? smoothstep(phase / CROWN_AT) : 1;
  const crown =
    phase < CROWN_AT ? 0 : phase >= 1 ? 1 : ((phase - CROWN_AT) / (1 - CROWN_AT)) ** 2.4;
  const relief = phase <= 1 ? 0 : Math.min(1, phase - 1);

  // Continuous across the departure by construction: `strain * 0.55 + crown *
  // 0.35` is exactly `AT_DEPARTURE` when both are 1, which is where the second
  // branch starts. A seam here would be a jolt at the one frame the whole
  // animation is about.
  const bulge =
    relief > 0
      ? AT_DEPARTURE * Math.exp(-3 * relief) * Math.cos(4.4 * relief)
      : strain * 0.55 + crown * 0.35;

  const vent = relief > 0 ? Math.exp(-9 * relief) : crown;
  const tremor = strain * (1 - crown) * Math.sin(time * 17);
  return { strain, crown, relief, bulge, vent, tremor };
}

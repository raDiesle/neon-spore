import type { OwnMotion } from "@neon-spore/content";
import { pose } from "./pose.js";

/**
 * The spare motions read off other games — `docs/tower-defence.md`.
 *
 * `plane.ts` and `depth.ts` were written forward from this game's own
 * questions. These three were written *backwards*, from three moments in
 * somebody else's frame that were legible without a word of explanation, and
 * each one is here because the thing that made it legible was the timing
 * rather than the body.
 *
 * The rule they are held to is `plane.ts`'s and does not soften: told apart at
 * 26 px, offsets in tiles, well inside a lane. Two motions that differ by a
 * frequency are one motion written twice — so each of these had to earn a
 * signature no existing one already carries, and one candidate was dropped for
 * failing that (a strobing invulnerability, which is SWELL with a harder edge
 * and is `throb` besides).
 */

/**
 * Struck, thrown back, and it comes on again.
 *
 * The knock-back every lane defence has and this game does not: a hit that
 * does not kill, so a column the pair had closed reopens. It is written as
 * `RECOIL` on the tower-defence page and this is what it would look like.
 *
 * The signature is the **hold**. Up is one tenth of the cycle and violent;
 * the return is six times slower; and then nothing happens for over half of
 * it, which is the part that reads as *coming on again* rather than as
 * bobbing. HEAVE is the nearest thing here and is its opposite: HEAVE never
 * stops, because a body fighting its own weight has no moment of rest.
 */
export const RECOIL: OwnMotion = {
  name: "RECOIL",
  note: "knocked back hard, drifts down slowly, then holds — a hit it survived",
  poseAt(t) {
    const period = 6;
    const p = (t % period) / period;
    // One kick, an eased fall, then flat. `back` is 1 at the top of the knock.
    let back = 0;
    if (p < 0.1) back = Math.sin((p / 0.1) * Math.PI * 0.5);
    else if (p < 0.7) back = Math.cos((((p - 0.1) / 0.6) * Math.PI) / 2) ** 2;
    return pose(0, -back * 0.22, back * 0.18, 1 + back * 0.09, 1 - back * 0.11);
  },
};

/**
 * Two clocks on one body: a slow tumble with a fast tremor riding on it.
 *
 * Read off the falling meteor sprite whose tail flickers several times per
 * rotation, and off Sarelgaz's legs, which idle on a period the abdomen does
 * not share. Both are the same trick and it is the cheapest thing on the
 * tower-defence page: a body with one clock reads as drawn, and a body with
 * two reads as alive, at no cost in silhouette.
 *
 * It is TURN's pair and must be judged beside it. TURN is the same slow
 * rotation with nothing on it — so what the two cards ask is whether a tremor
 * at seventeen times the rotation is visible at 26 px or is simply noise, and
 * the answer decides whether the second clock is worth having anywhere.
 */
export const TUMBLE: OwnMotion = {
  name: "TUMBLE",
  note: "a slow turn with a fast tremor on it — one body, two clocks",
  poseAt: (t) =>
    pose(
      Math.sin(t * 5.9) * 0.012,
      0,
      t * 0.34375 + Math.sin(t * 5.9) * 0.05,
      1 + Math.sin(t * 5.9) * 0.02,
      1 - Math.sin(t * 5.9 + 1.1) * 0.02,
    ),
};

/**
 * Drifts off its line, then corrects — fast, and all the way back.
 *
 * Missile Command's smart bomb, which steers around an explosion that was not
 * placed well enough. On the page that is `SMART`: a rock a shield only grazes
 * does not stop, it goes back onto its line and comes on. The animation is the
 * whole mechanic, because the pair has to *notice the correction* to know the
 * catch half-worked.
 *
 * LURCH and CANT both travel and both stay where they went; this is the one
 * that returns, and the asymmetry is the tell — four beats wandering out, half
 * a beat coming back. A body that drifts and eases home reads as loose. A body
 * that drifts and snaps home reads as steered, and steered is the claim.
 */
export const SETTLE: OwnMotion = {
  name: "SETTLE",
  note: "wanders off its line, then snaps back onto it — a body being steered",
  poseAt(t) {
    const period = 5;
    const p = (t % period) / period;
    // Out over four fifths, back over the last tenth, then flat and straight.
    const out = p < 0.8 ? Math.sin((p / 0.8) * Math.PI * 0.5) : Math.max(0, 1 - (p - 0.8) / 0.1);
    return pose(out * 0.19, 0, out * 0.22, 1, 1);
  },
};

import { batonHand, diastoleHand, throatHand } from "./boss-hands-beats.js";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **The states a beat earns** — THE DIASTOLE's chambers, THE BATON's
 * crossing, THE THROAT's inhale — posed the way `poses-bosses-hands-shots.ts`
 * poses the shot bosses': the boss's wave, a hand on the controls
 * (`boss-hands-beats.ts`), the run held until the state is there.
 *
 * These are the long ones. THE THROAT's rings come off one carry at a time
 * and its last phase is sixty beats in; THE BATON's crossing is near a
 * hundred, and its first is spoiled by a rock the wave drops down the
 * bead's column — the miss, the arm regrown, and the second crossing made
 * whole at a hundred and forty-six. The budgets say so, and a wave retuned
 * under them fails `test/poses.test.ts` instead of posing something else.
 */

export const BEAT_HAND_POSES: Pose[] = [
  bossPose(
    "diastole",
    "two",
    "Both chambers beating, each on its own count, and nothing single lands any more: only a beam standing in the bridge on a beat both are shut takes anything off it.",
    { hand: diastoleHand, hold: 12 },
  ),
  bossPose(
    "diastole",
    "alone",
    "One chamber taken and the other beating alone on the faster count. The bridge still wants the beam, and the coincidence to count is now with a chamber that is not there.",
    { hand: diastoleHand, hold: 12 },
  ),
  bossPose(
    "diastole",
    "burst",
    "The second chamber burst under the beam: the heart still, both columns clear, and the wave's own creatures coming down through where it hung.",
    { hand: diastoleHand, hold: 6 },
  ),
  bossPose(
    "baton",
    "crossing",
    "The merged bead out of the last socket on its final flight: no socket to land in, and the pair owing it an act a beat in turn — his trigger, her bolt — all the way down or it goes back to the top.",
    { hand: batonHand, hold: 12, budgetBeats: 110 },
  ),
  bossPose(
    "baton",
    "falling",
    "Every act made and the bead dropped as a loose pod under the arm: the crossing is over and the catch is the pilot's, with the maw under it.",
    { hand: batonHand, budgetBeats: 160 },
  ),
  bossPose(
    "baton",
    "down",
    "The bead taken and the arm folding: every socket dark, the fold given its beats before the wave is allowed to end under it.",
    { hand: batonHand, hold: 12, budgetBeats: 160 },
  ),
  bossPose(
    "throat",
    "slide",
    "The first ring carried in and the mouth sliding: a column a beat now, so the gum flung along the row has to be flung to where the mouth will be, not where it is.",
    { hand: throatHand, hold: 12 },
  ),
  bossPose(
    "throat",
    "quick",
    "Two rings in and the inhale on its quick count: the mouth crosses two columns a beat and the carry has to be answered the beat it is asked for.",
    { hand: throatHand, hold: 12 },
  ),
  bossPose(
    "throat",
    "open",
    "Four rings in and the mouth open wide: three columns of it, the last ring to feed, and the widest thing the field has had over it.",
    { hand: throatHand, hold: 12, budgetBeats: 90 },
  ),
  bossPose(
    "throat",
    "everts",
    "The last ring in and the throat turned inside out: the mouth gone, the rings hanging outward, and the wave running on under the wreck of it.",
    { hand: throatHand, hold: 12, budgetBeats: 90 },
  ),
];

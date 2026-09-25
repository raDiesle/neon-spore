import { batonDrawHand, batonHand, throatHand } from "./boss-hands-beats.js";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **The states a beat earns** — THE BATON's crossing, THE THROAT's inhale — posed the way `poses-bosses-hands-shots.ts`
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
    "baton",
    "merging",
    "Both beads at rest and the arm one segment long. P1 holds a thumb on his bead; P2 holds one on hers.",
    { hand: batonDrawHand, hold: 6, budgetBeats: 110 },
  ),
  bossPose(
    "baton",
    "crossing",
    "The merged bead on its last flight, with no socket to land in. P1 triggers; P2 bolts, a beat each in turn.",
    { hand: batonHand, hold: 12, budgetBeats: 110 },
  ),
  bossPose(
    "baton",
    "falling",
    "Every act made and the bead falling as a loose pod. P1 puts the maw under it; P2 waits.",
    { hand: batonHand, budgetBeats: 160 },
  ),
  bossPose(
    "baton",
    "down",
    "The bead taken and the arm folding dark. P1 aims at the wave again; P2 fires.",
    { hand: batonHand, hold: 12, budgetBeats: 160 },
  ),
  bossPose(
    "throat",
    "slide",
    "One ring in and the mouth slides a column a beat. P1 aims ahead of it; P2 flings a gum along its row.",
    { hand: throatHand, hold: 12 },
  ),
  bossPose(
    "throat",
    "quick",
    "Two rings in and the mouth crosses two columns a beat. P1 answers the carry on the beat; P2 flings.",
    { hand: throatHand, hold: 12 },
  ),
  bossPose(
    "throat",
    "open",
    "Four rings in and the mouth three columns wide. P1 hauls the tube; P2 flings a gum into the mouth.",
    { hand: throatHand, hold: 12, budgetBeats: 90 },
  ),
  bossPose(
    "throat",
    "everts",
    "The last ring in and the tube turned inside out. P1 aims at the wave again; P2 fires.",
    { hand: throatHand, hold: 12, budgetBeats: 90 },
  ),
];

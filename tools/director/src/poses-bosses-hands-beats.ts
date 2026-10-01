import { batonDrawHand, batonHand, throatHand } from "@neon-spore/hands";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **The states a beat earns** — THE BATON's crossing, THE THROAT's suck — posed the way `poses-bosses-hands-shots.ts`
 * poses the shot bosses': the boss's wave, a hand on the controls
 * (`boss-hands-beats.ts`), the run held until the state is there.
 *
 * These are the long ones. THE THROAT's rings come off one swallow at a time
 * and its last phase waits on five bodies falling into reach; THE BATON's crossing is near a
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
    "sucks",
    "The mouth carried over a body and pumped wide, in the colour that body wants. P2 pulls the mouth; P1 pumps.",
    { hand: throatHand, hold: 12 },
  ),
  bossPose(
    "throat",
    "everts",
    "The last ring slack and the tube turned inside out. P1 and P2 are asked for nothing.",
    { hand: throatHand, hold: 12, budgetBeats: 160 },
  ),
];

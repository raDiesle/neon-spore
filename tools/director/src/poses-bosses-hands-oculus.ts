import { oculusHand } from "@neon-spore/hands";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE OCULUS's four states**, posed with a hand on the controls
 * (`boss-hands-oculus.ts`): the still and the first lit pair arrive by
 * themselves, and the rest and the shatter are earned by both leaves held
 * together and the socket shot in its colour.
 */
export const OCULUS_POSES: Pose[] = [
  bossPose(
    "oculus",
    "still",
    "The lens drops in over the middle of the field. P1 and P2 wait: no pair is lit yet.",
    { hold: 6 },
  ),
  bossPose(
    "oculus",
    "lit",
    "The first pair of leaves lit white. P1 holds the left half of the lens; P2 the right.",
    { hold: 6 },
  ),
  bossPose("oculus", "rest", "A pair shut and the lens resting. P1 and P2 let go and wait.", {
    hand: oculusHand,
    hold: 6,
  }),
  bossPose(
    "oculus",
    "shatter",
    "Every step answered, the lens breaking apart. P1 and P2 are done.",
    { hand: oculusHand, hold: 6, budgetBeats: 200 },
  ),
];

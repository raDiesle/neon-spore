import { trivetHand } from "@neon-spore/hands";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE TRIVET's four states**, posed with a hand on the controls
 * (`boss-hands-trivet.ts`): the still and the first lit foot arrive by
 * themselves, and the rest and the collapse are earned by each foot's chord
 * held down by its own seat and the lit hub shot in its colour.
 */
export const TRIVET_POSES: Pose[] = [
  bossPose(
    "trivet",
    "still",
    "The stand drops in over the middle of the field, both feet lifted. P1 and P2 wait: no pad is lit yet.",
    { hold: 6 },
  ),
  bossPose(
    "trivet",
    "lit",
    "The front foot's first two sockets lit. P1 holds two fingers down on them and keeps them down; P2 waits.",
    { hold: 6 },
  ),
  bossPose(
    "trivet",
    "rest",
    "A foot planted and the stand resting. P1 lifts; P2 waits for the rear foot.",
    { hand: trivetHand, hold: 6 },
  ),
  bossPose(
    "trivet",
    "collapse",
    "Every step answered, all three legs splaying flat. P1 and P2 are done.",
    { hand: trivetHand, hold: 6, budgetBeats: 200 },
  ),
];

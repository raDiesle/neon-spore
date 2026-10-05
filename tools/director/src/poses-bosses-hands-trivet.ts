import { trivetHand } from "@neon-spore/hands";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE TRIVET's five states**, posed with a hand on the controls
 * (`boss-hands-trivet.ts`): the still and the first lit foot arrive by
 * themselves, and the rest, the ring and the collapse are earned by each
 * foot's chord held down by its own seat and the lit hub shot in its colour —
 * the ring, row 11's, with every pad left up.
 *
 * `trivet:foot` is judged on the still, because both outer feet hang lifted
 * there and the hub is not lurching: a foot that dangles while it is lifted
 * is only seen where it is.
 */
export const TRIVET_POSES: Pose[] = [
  bossPose(
    "trivet",
    "still",
    "The stand drops in over the middle of the field, both feet lifted. P1 and P2 wait: no pad is lit yet.",
    {
      hold: 6,
      lookAt:
        "the two lifted outer feet — whether they hang alive from their legs or are bolted in the air",
    },
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
    "ring",
    "The hub is spent; the planted feet ring under it, dying out. P1 and P2 leave every pad up.",
    {
      hand: trivetHand,
      hold: 6,
      budgetBeats: 240,
      lookAt:
        "the rings under the planted feet — whether they read as a stand ringing out, or as a target",
    },
  ),
  bossPose(
    "trivet",
    "collapse",
    "Every step answered, all three legs splaying flat. P1 and P2 are done.",
    { hand: trivetHand, hold: 6, budgetBeats: 200 },
  ),
];

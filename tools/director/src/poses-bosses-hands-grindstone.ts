import { grindstoneHand } from "@neon-spore/hands";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE GRINDSTONE's four states**, posed with a hand on the controls
 * (`boss-hands-grindstone.ts`): the still and the first lit flat arrive by
 * themselves, and the rest and the fall are earned by each seat rubbing its
 * own flat clean, the caliper bitten shut and the wheel shot in its colour.
 *
 * `grindstone:jaw` is judged on the still, because the caliper stands open
 * there and nothing else on the wheel is moving: a jaw that trembles while
 * open and goes still as it bites is only seen where it is open.
 */
export const GRINDSTONE_POSES: Pose[] = [
  bossPose(
    "grindstone",
    "still",
    "The wheel hangs over the middle of the field with the caliper open round it. P1 and P2 wait: no flat is lit yet.",
    {
      hold: 6,
      lookAt:
        "the caliper's two open jaws round the top of the wheel — whether their tips are alive or bolted on",
    },
  ),
  bossPose(
    "grindstone",
    "lit",
    "The left flat lit under its film. P1 rubs it back and forth until it is clean; P2 waits.",
    { hold: 6 },
  ),
  bossPose(
    "grindstone",
    "rest",
    "A pass ground off the left flat and the wheel resting between steps. P1 lifts; P2 waits for the right flat.",
    { hand: grindstoneHand, hold: 6 },
  ),
  bossPose(
    "grindstone",
    "free",
    "Every step answered: the caliper snapped off and the wheel spinning free, falling edge-on. P1 and P2 are done.",
    { hand: grindstoneHand, hold: 6, budgetBeats: 240 },
  ),
];

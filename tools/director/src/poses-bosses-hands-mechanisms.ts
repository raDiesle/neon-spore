import { plumbHand, slingHand, trapezeHand } from "@neon-spore/hands";
import { type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE DAVIT's, THE PLUMB's and THE SLING's stills**: each machine arrived
 * and standing, no step lit yet. Their other states are the look lanes' and
 * stay on `OWED` (`test/boss-states.test.ts`) — but for THE PLUMB's bleed
 * and THE SLING's cool, each row 11's look, played to by its own hand: every
 * step answered, both thumbs up after the last shot. THE TRAPEZE's swing
 * coming down on its ropes, and its first level pushed by its own hand.
 */
export const MECHANISM_POSES: Pose[] = [
  bossPose(
    "davit",
    "still",
    "The boom stands up off its mast over the middle column, the hook hung on its chain. P1 and P2 wait: nothing is lit yet.",
    {
      hold: Math.round(TPB * 1.9),
      lookAt: "the hook on its chain — whether it hangs or is welded on",
    },
  ),
  bossPose(
    "plumb",
    "still",
    "The bob hangs tilted on its hook, a ball on a chain at each end of its beam. P1 and P2 wait: nothing is lit yet.",
    {
      hold: Math.round(TPB * 1.9),
      lookAt: "the bob on its hook — whether it hangs or is bolted there",
    },
  ),
  bossPose(
    "plumb",
    "bleed",
    "The core is spent; its light runs down both chains, white to bronze. P1 and P2 let go of both stones.",
    {
      hand: plumbHand,
      hold: Math.round(TPB * 1.4),
      budgetBeats: 160,
      lookAt: "the light on the chains — whether it reads as running down, or as two lamps",
    },
  ),
  bossPose(
    "sling",
    "still",
    "The fork has swung into stand over the middle column, a slack cord off each tine. P1 and P2 wait: nothing is lit yet.",
    {
      hold: Math.round(TPB * 1.9),
      lookAt: "the two tines — whether they spring or are one casting",
    },
  ),
  bossPose(
    "sling",
    "cool",
    "The yoke is spent; the cup ticks as it cools, white to steel. P1 and P2 leave both draws alone.",
    {
      hand: slingHand,
      hold: Math.round(TPB * 1.4),
      budgetBeats: 160,
      lookAt: "the cup cooling — whether it reads as heat dying, or as a lamp dimming",
    },
  ),
  bossPose(
    "trapeze",
    "enter",
    "The swing comes down on its long ropes over the middle, the alien on the plank. P1 and P2 wait: nothing is lit yet.",
    { lookAt: "the ropes — whether they read as hung from above the screen, or as cut off" },
  ),
  bossPose(
    "trapeze",
    "level",
    "Level one: P1 swipes the left zone, P2 the right, as the swing comes back over it. The gauge climbs to the gong.",
    {
      hand: trapezeHand,
      hold: TPB * 6,
      lookAt: "the gauge under the arc — whether it reads as how high the swing goes",
    },
  ),
];

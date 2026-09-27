import { type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE DAVIT's, THE PLUMB's and THE SLING's stills**: each machine arrived
 * and standing, no step lit yet. Their other states are the look lanes' and
 * stay on `OWED` (`test/boss-states.test.ts`).
 *
 * `davit:hook`, `plumb:bob` and `sling:tine` are judged here, because every
 * step of the three opens THE SLOW and stills the swing: a hung part moving on
 * its own is only seen where nothing asks (`mechanism-swing.ts`).
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
    "sling",
    "still",
    "The fork has swung into stand over the middle column, a slack cord off each tine. P1 and P2 wait: nothing is lit yet.",
    {
      hold: Math.round(TPB * 1.9),
      lookAt: "the two tines — whether they spring or are one casting",
    },
  ),
];

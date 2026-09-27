import { viseHand } from "@neon-spore/hands";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE VISE's four states**, posed with a hand on the controls
 * (`boss-hands-vise.ts`): the still and the first lit lobe arrive by
 * themselves, and the rest and the split are earned by each lobe pinched shut
 * by its own seat and the bared kernel shot in its colour.
 *
 * **The rest is the one after both lobes stand cracked open**, not the first:
 * it is the only frame the kernel is dull and uncovered, so `vise:kernel` is
 * judged on it — a kernel under closed lobes cannot be seen turning.
 */
export const VISE_POSES: Pose[] = [
  bossPose(
    "vise",
    "still",
    "The seed-case drops in over the middle of the field. P1 and P2 wait: no lobe is lit yet.",
    { hold: 6 },
  ),
  bossPose(
    "vise",
    "lit",
    "The left lobe's seam lit white. P1 pinches it shut and keeps it shut; P2 waits.",
    { hold: 6 },
  ),
  bossPose(
    "vise",
    "rest",
    "Both lobes cracked open and the case resting, the kernel bare and dull in its hollow. P1 and P2 wait for the fire step.",
    {
      hand: viseHand,
      hold: 6,
      want: (w) => w.boss?.kind === "vise" && w.boss.phase === "rest" && w.boss.bared,
      lookAt: "the bare kernel — whether it sits alive in its hollow or is a stone set in it",
    },
  ),
  bossPose(
    "vise",
    "split",
    "Every step answered, the case splitting down its spine. P1 and P2 are done.",
    { hand: viseHand, hold: 6, budgetBeats: 200 },
  ),
];

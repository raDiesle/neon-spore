import { mantleHand } from "@neon-spore/hands";
import { mantleBoss, mantleLeaking, type World } from "@neon-spore/sim";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE MANTLE's five states**, posed with a hand on the controls
 * (`boss-hands-mantle.ts`): the still and the first lit pull arrive by
 * themselves, and the rest are earned by both handles pulled together.
 *
 * **The spark is not a stored phase.** The step leaks it with the handles
 * still lit and the phase still `pull` (`sim/mantle-step.ts`), so its card
 * arrives on the leak itself rather than on a phase by that name.
 */
const leaking = (w: World): boolean => {
  const s = mantleBoss(w);
  return s !== null && mantleLeaking(s);
};

export const MANTLE_POSES: Pose[] = [
  bossPose(
    "mantle",
    "still",
    "The shell hangs shut over the field. P1 and P2 wait: no handle is lit yet.",
    { hold: 6 },
  ),
  bossPose(
    "mantle",
    "pull",
    "Both handles lit. P1 pulls the left knob down; P2 pulls the right, together.",
    { hold: 6 },
  ),
  bossPose(
    "mantle",
    "spark",
    "Two pairs off, a spark leaking to the hull. P1 aims the middle; P2 fires.",
    { hand: mantleHand, want: leaking, hold: 6 },
  ),
  bossPose(
    "mantle",
    "heartbeat",
    "The shell split, the core bare. P1 taps the ring, then P2, in turn.",
    { hand: mantleHand, hold: 6, budgetBeats: 120 },
  ),
  bossPose("mantle", "dark", "The core out and the shell hanging open. P1 and P2 are done.", {
    hand: mantleHand,
    hold: 6,
    budgetBeats: 160,
  }),
];

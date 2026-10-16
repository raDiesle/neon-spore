import { broodHand } from "@neon-spore/hands";
import { broodBoss, type World } from "@neon-spore/sim";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE BROOD's states**, posed with a hand on the controls
 * (`boss-hands-brood.ts`): the sac comes down by itself, and every other
 * phase is reached by popping the buds before it, the way the pair would —
 * THE HYDRA's cards (`poses-bosses-hands-hydra.ts`). The cards are the rig's
 * screen, which is both seats.
 */

/** Whether the brood is in `phase`, `beats` into it. */
const into =
  (phase: string, beats: number) =>
  (w: World): boolean => {
    const s = broodBoss(w);
    return s?.phase === phase && w.beat - s.phaseBeat >= beats;
  };

export const BROOD_POSES = [
  bossPose(
    "brood",
    "enter",
    "A sac of slime comes down over the field. P1 and P2 wait: nothing is asked yet.",
    { want: into("enter", 2) },
  ),
  bossPose(
    "brood",
    "grow",
    "A bud swells on the rim. P1 slides the cannon under it, P2 fires its colour before it drops.",
    { hand: broodHand, want: into("grow", 2) },
  ),
  bossPose(
    "brood",
    "rest",
    "Every bud of a step popped: the sac heaves and turns, and grows the next. P1 and P2 wait.",
    { hand: broodHand, want: into("rest", 1), budgetBeats: 80 },
  ),
  bossPose(
    "brood",
    "spent",
    "The last bud popped: the brood is beaten. P1 and P2 let go and watch it sag away.",
    { hand: broodHand, want: into("spent", 1), budgetBeats: 260 },
  ),
];

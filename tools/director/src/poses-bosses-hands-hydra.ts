import { hydraHand } from "@neon-spore/hands";
import { hydraBoss, type World } from "@neon-spore/sim";
import { POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE HYDRA's states**, posed with a hand on the controls
 * (`boss-hands-hydra.ts`): the body arrives by itself, a level runs out and
 * strikes when nobody touches it, and every other phase is reached by
 * stopping the heads before it, the way the pair would — THE CHRYSALIS's
 * cards (`poses-bosses-hands-chrysalis.ts`). The cards are the rig's screen,
 * which is both seats.
 */

/** Whether the hydra is in `phase`, `beats` into it. */
const into =
  (phase: string, beats: number) =>
  (w: World): boolean => {
    const s = hydraBoss(w);
    return s?.phase === phase && (w.beat - s.phaseBeat) * TPB >= beats * TPB;
  };

export const HYDRA_POSES = [
  bossPose(
    "hydra",
    "enter",
    "A slime with many heads comes in over the field. P1 and P2 wait: nothing is asked yet.",
    { want: into("enter", 2) },
  ),
  bossPose(
    "hydra",
    "heads",
    "Necks swing down at the ship. P1 swipes across the left ones to cut them, P2 the right.",
    { hand: hydraHand, want: into("heads", 1) },
  ),
  bossPose(
    "hydra",
    "rear",
    "A level of heads stopped: the body rears back and grows the next. P1 and P2 wait.",
    { hand: hydraHand, want: into("rear", 1), budgetBeats: 80 },
  ),
  bossPose(
    "hydra",
    "struck",
    "P1 and P2 cut no neck in time: a head bites the hull and the wave is lost.",
    { want: into("struck", 0), budgetBeats: 60 },
  ),
  bossPose(
    "hydra",
    "spent",
    "The last maw quenched: the hydra is beaten. P1 and P2 let go and watch it sink.",
    { hand: hydraHand, want: into("spent", 1), budgetBeats: 360 },
  ),
];

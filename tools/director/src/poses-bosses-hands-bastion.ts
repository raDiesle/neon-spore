import { bastionHand } from "@neon-spore/hands";
import { bastionBoss, type World } from "@neon-spore/sim";
import { POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE BASTION's states**, posed with a hand on the controls
 * (`boss-hands-bastion.ts`): the moon arrives by itself, a shell grows back
 * when nobody touches it, and every other phase is reached by taking the
 * shells before it off, the way the pair would. The cards are the rig's
 * screen, which is both seats.
 */

/** Whether the moon is in `phase`, `beats` into it. */
const into =
  (phase: string, beats: number) =>
  (w: World): boolean => {
    const s = bastionBoss(w);
    return s?.phase === phase && (w.beat - s.phaseBeat) * TPB >= beats * TPB;
  };

export const BASTION_POSES = [
  bossPose(
    "bastion",
    "enter",
    "A metal moon in four shells comes in over the field. P1 and P2 wait: nothing is asked yet.",
    { want: into("enter", 2) },
  ),
  bossPose(
    "bastion",
    "layer",
    "The outer panels are lit. P1 pulls the left ones out, P2 the right ones, away from the moon.",
    { hand: bastionHand, want: into("layer", 1) },
  ),
  bossPose(
    "bastion",
    "shed",
    "A shell taken off whole: it flies apart and the moon is smaller. P1 and P2 wait for the next.",
    { hand: bastionHand, want: into("shed", 1), budgetBeats: 80 },
  ),
  bossPose(
    "bastion",
    "regrow",
    "The panels ran out of time and grow back whole. Nothing hits the ship: P1 and P2 start again.",
    { want: into("regrow", 1), budgetBeats: 60 },
  ),
  bossPose(
    "bastion",
    "spent",
    "The last shell off: the core blows. P1 and P2 let go and watch the moon go.",
    { hand: bastionHand, want: into("spent", 1), budgetBeats: 260 },
  ),
];

import { chrysalisHand } from "@neon-spore/hands";
import { chrysalisBoss, type World } from "@neon-spore/sim";
import { POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE CHRYSALIS's states**, posed with a hand on the controls
 * (`boss-hands-chrysalis.ts`): the cocoon arrives by itself, a skin grows
 * back when nobody touches it, and every other phase is reached by peeling
 * the skins before it, the way the pair would — THE BASTION's cards
 * (`poses-bosses-hands-bastion.ts`). The cards are the rig's screen, which is
 * both seats.
 */

/** Whether the cocoon is in `phase`, `beats` into it. */
const into =
  (phase: string, beats: number) =>
  (w: World): boolean => {
    const s = chrysalisBoss(w);
    return s?.phase === phase && (w.beat - s.phaseBeat) * TPB >= beats * TPB;
  };

export const CHRYSALIS_POSES = [
  bossPose(
    "chrysalis",
    "enter",
    "A living cocoon in four skins comes in over the field. P1 and P2 wait: nothing is asked yet.",
    { want: into("enter", 2) },
  ),
  bossPose(
    "chrysalis",
    "skin",
    "The slime is lit. P1 rubs the left half off, P2 the right half, back and forth.",
    { hand: chrysalisHand, want: into("skin", 1) },
  ),
  bossPose(
    "chrysalis",
    "shed",
    "A skin peeled off whole: it falls away and the cocoon is smaller. P1 and P2 wait for the next.",
    { hand: chrysalisHand, want: into("shed", 1), budgetBeats: 80 },
  ),
  bossPose(
    "chrysalis",
    "regrow",
    "The slime ran out of time and grows back whole. Nothing hits the ship: P1 and P2 start again.",
    { want: into("regrow", 1), budgetBeats: 60 },
  ),
  bossPose(
    "chrysalis",
    "spent",
    "The last skin off: the grub dies. P1 and P2 let go and watch the cocoon go.",
    { hand: chrysalisHand, want: into("spent", 1), budgetBeats: 300 },
  ),
];

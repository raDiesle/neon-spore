import { fieldHand } from "@neon-spore/hands";
import { matronBoss, type World } from "@neon-spore/sim";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE MATRON's states**, posed with the field's own hand on the controls
 * (`autopilot-field-hand.ts`), because her pods are the ordinary pods and her
 * throws the ordinary field: she comes in by herself, and every later phase
 * is reached by taking her pods the way the pair would — THE HYDRA's cards
 * (`poses-bosses-hands-hydra.ts`). The cards are the rig's screen, which is
 * both seats.
 */

/** Whether the matron is in `phase`, `beats` into it. */
const into =
  (phase: string, beats: number) =>
  (w: World): boolean => {
    const s = matronBoss(w);
    return s?.phase === phase && w.beat - s.phaseBeat >= beats;
  };

export const MATRON_POSES = [
  bossPose(
    "matron",
    "enter",
    "A mother slime with pods on her lobes comes down over the field. P1 and P2 wait.",
    { want: into("enter", 2) },
  ),
  bossPose(
    "matron",
    "hang",
    "A clutch of pods hangs off her lobes. P2 shoots one loose; P1 moves under it and opens the maw.",
    { hand: fieldHand, want: into("hang", 2) },
  ),
  bossPose(
    "matron",
    "rear",
    "Every pod of the clutch swallowed: she rears back and grows the next. P1 and P2 wait.",
    { hand: fieldHand, want: into("rear", 1), budgetBeats: 120 },
  ),
  bossPose(
    "matron",
    "spent",
    "Her last pod swallowed: the matron is beaten. P1 and P2 watch her sink away.",
    { hand: fieldHand, want: into("spent", 1), budgetBeats: 400 },
  ),
];

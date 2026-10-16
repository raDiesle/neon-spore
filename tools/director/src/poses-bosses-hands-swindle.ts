import { fieldHand } from "@neon-spore/hands";
import { swindleBoss, type World } from "@neon-spore/sim";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE SWINDLE's states**, posed with the field's own hand on the controls
 * (`autopilot-field-hand.ts`), because her pods are the ordinary pods: she
 * comes in by herself, and every later phase is reached by taking her real
 * pods and refusing her fakes the way the pair would — THE MATRON's cards
 * (`poses-bosses-hands-matron.ts`). The cards are the rig's screen, which is
 * both seats.
 */

/** Whether the swindle is in `phase`, `beats` into it. */
const into =
  (phase: string, beats: number) =>
  (w: World): boolean => {
    const s = swindleBoss(w);
    return s?.phase === phase && w.beat - s.phaseBeat >= beats;
  };

export const SWINDLE_POSES = [
  bossPose(
    "swindle",
    "enter",
    "A slime with a row of pods comes in over the field. P1 and P2 wait.",
    { want: into("enter", 2) },
  ),
  bossPose(
    "swindle",
    "hang",
    "A hand of pods hangs, real and fake, and two of them trade places. P2 watches the fake ones; P1 waits for the call.",
    { hand: fieldHand, want: into("hang", 3) },
  ),
  bossPose(
    "swindle",
    "rear",
    "Every pod of the hand gone, real ones swallowed and fakes refused: she rears back. P1 and P2 wait.",
    { hand: fieldHand, want: into("rear", 1), budgetBeats: 120 },
  ),
  bossPose(
    "swindle",
    "spent",
    "Her last hand cleared: the swindle is beaten. P1 and P2 watch her go.",
    { hand: fieldHand, want: into("spent", 1), budgetBeats: 400 },
  ),
];

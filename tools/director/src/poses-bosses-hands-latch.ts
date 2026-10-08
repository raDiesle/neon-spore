import { latchHand } from "@neon-spore/hands";
import { latchBoss, type World } from "@neon-spore/sim";
import { POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE LATCH's states**, posed with a hand on the controls
 * (`boss-hands-latch.ts`): the drop arrives by itself, and every later phase
 * is reached by hauling the levels before it, hand over hand, the way the
 * pair would. The cards are the rig's screen, which is both seats.
 */

/** Whether the latch is in `phase`, `beats` into it. */
const into =
  (phase: string, beats: number) =>
  (w: World): boolean => {
    const s = latchBoss(w);
    return s?.phase === phase && (w.beat - s.phaseBeat) * TPB >= beats * TPB;
  };

export const LATCH_POSES = [
  bossPose(
    "latch",
    "enter",
    "The slime drops in over the field and hooks its rope into the hull. P1 and P2 wait: nothing is asked yet.",
    { want: into("enter", 2) },
  ),
  bossPose(
    "latch",
    "level",
    "The rope is taut. P1's grip on the left pulls first while P2's on the right holds, then they swap.",
    { hand: latchHand, want: into("level", 1) },
  ),
  bossPose(
    "latch",
    "rest",
    "A level hauled in: two knots through the hull and two lobes torn off. P1 and P2 wait for the next.",
    { hand: latchHand, want: into("rest", 1), budgetBeats: 60 },
  ),
  bossPose(
    "latch",
    "spent",
    "The last knot in: the rope snaps and the slime falls away. P1 and P2 let go and watch it fall.",
    { hand: latchHand, want: into("spent", 1), budgetBeats: 200 },
  ),
];

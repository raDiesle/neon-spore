import { mothHand } from "@neon-spore/hands";
import { mothBoss, type World } from "@neon-spore/sim";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE MOTH's states**, posed with a hand on the controls
 * (`boss-hands-moth.ts`): it flutters in by itself, and every other phase is
 * reached by shooting its spots and belly the way the pair would — THE
 * BROOD's cards (`poses-bosses-hands-brood.ts`). The cards are the rig's
 * screen, which is both seats.
 */

/** Whether the moth is in `phase`, `beats` into it. */
const into =
  (phase: string, beats: number) =>
  (w: World): boolean => {
    const s = mothBoss(w);
    return s?.phase === phase && w.beat - s.phaseBeat >= beats;
  };

export const MOTH_POSES = [
  bossPose(
    "moth",
    "enter",
    "A great moth flutters in over the field. P1 and P2 wait: nothing is asked yet.",
    { want: into("enter", 2) },
  ),
  bossPose(
    "moth",
    "flit",
    "Red spots glow on its wings. P1 puts the cannon under one, P2 fires red before the moth comes over.",
    { hand: mothHand, want: into("flit", 1) },
  ),
  bossPose("moth", "rest", "Both spots hit: the wings tear and it flutters up. P1 and P2 wait.", {
    hand: mothHand,
    want: into("rest", 1),
    budgetBeats: 80,
  }),
  bossPose(
    "moth",
    "spent",
    "The belly hit the last time: the moth is beaten. P1 and P2 watch it fall away.",
    { hand: mothHand, want: into("spent", 1), budgetBeats: 260 },
  ),
];

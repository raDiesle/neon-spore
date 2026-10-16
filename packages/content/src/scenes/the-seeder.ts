import type { GuideScene } from "../scene-types.js";

/**
 * THE SEEDER's rehearsal: the kill is a debt.
 *
 * One body and the three things its death costs, each on the seat that pays
 * it: the navigator's shot kills it and a pod is left hanging where it was,
 * the navigator's second shot frees that pod, and the pilot's maw takes it in
 * (`sim/seeder.ts`). What the film must not do is end on the kill — that is
 * the reflex the creature exists to punish, a pair who hear "got it" and stop
 * counting what is still up there.
 */
export const THE_SEEDER: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 1, col: 2, kind: "seeder", color: "red" }],
  acts: [
    { tick: 90, control: "cannon", col: 2 },
    { tick: 330, control: "fireRed" },
    // The second shot frees the pod the first one left.
    { tick: 600, control: "fireRed" },
    { tick: 800, control: "intake" },
  ],
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "PLAYER 1 MOVES CANNON",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 240,
      seat: 2,
      text: "KILL IT · IT LEAVES A POD",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 480,
      seat: 2,
      text: "SHOOT THE POD LOOSE",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 690,
      seat: 1,
      text: "SUCK AS IT LANDS",
      anchor: { at: "control", control: "intake" },
    },
  ],
};

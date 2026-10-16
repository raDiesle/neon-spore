import type { GuideScene } from "../scene-types.js";

/**
 * THE GLUTTON's rehearsal: a race for a hanging pod.
 *
 * One pod and one glutton coming down on it. The navigator's shot frees the
 * pod before the body gets there, the pilot's maw takes it, and only then does the
 * navigator turn the cannon's colour on the glutton, a hungry one, which one
 * shot kills (`sim/glutton.ts`). The meal it did not get is the lesson: what it
 * eats is not lost, but it is a shot more, and the film shows the order that
 * keeps it hungry.
 */
export const THE_GLUTTON: GuideScene = {
  ticks: 840,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 1, col: 3, kind: "glutton", color: "red" }],
  pods: [{ beat: 0, col: 3, row: 6, kind: "pod" }],
  acts: [
    { tick: 90, control: "cannon", col: 3 },
    // Freed while the glutton is still rows above it.
    { tick: 210, control: "fireRed" },
    { tick: 380, control: "intake" },
    { tick: 640, control: "fireRed" },
  ],
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "PLAYER 1 MOVES CANNON",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 180,
      seat: 2,
      text: "FREE THE POD BEFORE IT EATS",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 360,
      seat: 1,
      text: "SUCK AS IT LANDS",
      anchor: { at: "control", control: "intake" },
    },
    {
      tick: 540,
      seat: 2,
      text: "THEN KILL IT",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};

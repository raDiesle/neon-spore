import type { SwindleStep } from "@neon-spore/sim";

/**
 * **THE SWINDLE's script: four hands** (`sim/swindle.ts`), the owner's boss
 * of 16 October 2026 for the real pod and the fake one together — the shell
 * game.
 *
 * Named rather than written out on the wave, THE INSTAR's reason
 * (`instar-script.ts`), and written back by the director by that name
 * (`serialize-boss.ts`).
 *
 * Each hand is the last one with one more pod or one more swap: a pod and a
 * fake traded once; three traded three times; a real pod between two fakes;
 * then two of each. A swap is `at` beats after the hand is hung and glides
 * for `swindleSwapBeats`; every pod is let go after the last swap has
 * stopped, five beats apart, so one pod is ever falling at a time and the
 * maw's window from the last has shut before the next arrives.
 */
export const SWINDLE_SCRIPT: readonly SwindleStep[] = [
  // One of each, traded once.
  {
    pods: [
      { offset: -2, kind: "pod" },
      { offset: 2, kind: "husk" },
    ],
    swaps: [{ at: 2, a: 0, b: 1 }],
    drops: [
      { at: 6, pod: 0 },
      { at: 11, pod: 1 },
    ],
  },
  // Two real and a fake between them, traded round.
  {
    pods: [
      { offset: -3, kind: "pod" },
      { offset: 0, kind: "husk" },
      { offset: 3, kind: "pod" },
    ],
    swaps: [
      { at: 2, a: 0, b: 1 },
      { at: 5, a: 1, b: 2 },
      { at: 8, a: 0, b: 2 },
    ],
    drops: [
      { at: 11, pod: 1 },
      { at: 16, pod: 0 },
      { at: 21, pod: 2 },
    ],
  },
  // One real between two fakes.
  {
    pods: [
      { offset: -3, kind: "husk" },
      { offset: 0, kind: "pod" },
      { offset: 3, kind: "husk" },
    ],
    swaps: [
      { at: 2, a: 1, b: 2 },
      { at: 5, a: 0, b: 1 },
      { at: 8, a: 0, b: 2 },
      { at: 11, a: 1, b: 2 },
    ],
    drops: [
      { at: 14, pod: 2 },
      { at: 19, pod: 1 },
      { at: 24, pod: 0 },
    ],
  },
  // Two of each.
  {
    pods: [
      { offset: -3, kind: "pod" },
      { offset: -1, kind: "husk" },
      { offset: 1, kind: "pod" },
      { offset: 3, kind: "husk" },
    ],
    swaps: [
      { at: 2, a: 0, b: 3 },
      { at: 5, a: 1, b: 2 },
      { at: 8, a: 0, b: 1 },
      { at: 11, a: 2, b: 3 },
      { at: 14, a: 1, b: 3 },
    ],
    drops: [
      { at: 17, pod: 3 },
      { at: 22, pod: 0 },
      { at: 27, pod: 1 },
      { at: 32, pod: 2 },
    ],
  },
];

import type { GuideScene } from "../scene-types.js";

/**
 * THE WARD's rehearsal: the shield answers a rock with nobody triggering it.
 *
 * The third pod. It holds the shield armed for six beats with no trigger at
 * all, which takes away the half of the coupling player 1 has been doing since
 * wave four — and the rocks that come with it are the fastest tiers in the
 * game, so there would not have been time for that half anyway.
 *
 * The last page is the one that matters and it is a page about something *not*
 * happening: the shield sits in the rock's column, nobody presses anything,
 * and the rock is turned away. *Armed is not aimed* — the column is still
 * hers to be standing in, and the film ends on her sliding into it and then
 * doing nothing at all.
 */
export const THE_WARD: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 8, col: 5, kind: "meteorFast", color: null }],
  pods: [{ beat: 0, col: 3, row: 2, kind: "ward" }],
  acts: [
    { tick: 370, control: "fireRed" },
    { tick: 540, control: "cannon", col: 4 },
    { tick: 600, control: "intake" },
    { tick: 760, control: "shield", col: 5 },
    { tick: 790, control: "shield", col: 5 },
  ],
  steps: [
    { tick: 0, seat: 1, text: "WARD POD · NO TRIGGER", anchor: { at: "pod" } },
    {
      tick: 280,
      seat: 2,
      text: "PLAYER 2 FREES IT",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 480,
      seat: 1,
      text: "PLAYER 1 TAKES IT IN",
      anchor: { at: "control", control: "intake" },
    },
    {
      tick: 670,
      seat: 2,
      text: "NOW JUST THE COLUMN",
      anchor: { at: "control", control: "shield" },
    },
  ],
};

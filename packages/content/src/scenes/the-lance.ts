import type { GuideScene } from "../scene-types.js";

/**
 * THE LANCE's rehearsal: one shot instead of three.
 *
 * The wave adds no button at all. What it teaches is that **the colour is
 * held**: player 2 keeps her thumb on the lobe instead of tapping it, the
 * cannon lobe fills for as long as player 1 keeps the cannon still, and at the
 * top of the fill the shot goes by itself — slower, and straight through every
 * body of that colour rather than stopping at the first
 * (`packages/sim/src/lance.ts`).
 *
 * **The film is about a thumb that does nothing**, which is the one thing a
 * still picture cannot show and the whole reason this wave has a rehearsal.
 * Four pages. He gets under the column first, because sliding a column
 * afterwards drops the fill back to nothing; then she holds, and the lobe
 * closes round the button while the beam climbs the column on both screens;
 * then it fires itself and takes all three.
 *
 * The thumb goes down and never comes up. `lancePrimeBeats` is three, so the
 * lobe is full a hundred and eighty ticks later and the film ends with the
 * finger still resting on a button that has already fired — which is exactly
 * what a hold looks like, and a lift would be a page about letting go, the one
 * thing this wave never wants anybody to do.
 */
export const THE_LANCE: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 1,
  entries: [
    { beat: 0, col: 2, color: "cyan" },
    { beat: 1, col: 2, color: "cyan" },
    { beat: 2, col: 2, color: "cyan" },
  ],
  acts: [
    { tick: 350, control: "cannon", col: 3 },
    { tick: 390, control: "cannon", col: 2 },
    // Held to the last tick of the film: `until` past `ticks` is a thumb that
    // is still there when the loop comes round, which is what this page is.
    { tick: 590, control: "fireCyan", until: 1080 },
  ],
  steps: [
    { tick: 0, seat: 2, text: "THREE CYAN, ONE COLUMN", anchor: { at: "body" } },
    {
      tick: 260,
      seat: 1,
      text: "GET UNDER THEM FIRST",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 500,
      seat: 2,
      text: "HOLD IT · DO NOT TAP",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 830,
      seat: 1,
      text: "ONE SHOT TAKES ALL THREE",
      anchor: { at: "body" },
    },
  ],
};

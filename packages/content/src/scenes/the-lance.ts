import type { GuideScene } from "../scene-types.js";

/**
 * THE LANCE's rehearsal: one shot instead of three.
 *
 * The wave adds no button at all. What it teaches is that **the colour is
 * held**: player 2 keeps her thumb on the lobe instead of tapping it, the
 * cannon lobe fills for as long as player 1 keeps the cannon still, and at the
 * top of the fill the beam *is* the weapon: the whole column burns at once, in
 * that colour, and nothing leaves the ship (`packages/sim/src/lance.ts`).
 *
 * **The film is about a thumb that does nothing**, which is the one thing a
 * still picture cannot show and the whole reason this wave has a rehearsal.
 * Four pages. He gets under the column first, because sliding a column
 * afterwards drops the fill back to nothing; then she reads what is coming
 * down it; then she holds, and the lobe closes round the button while the
 * beam climbs the column on both screens; then the beam reaches the top and
 * burns everything standing in it.
 *
 * His page is the first one, before hers names the three, because a page
 * about a body holds with that body in the middle of the screen
 * (`scene-pages.test.ts`) and three bulbs a beat apart have the top one on
 * row six only nine beats in — which leaves the bottom one six beats from
 * the hull, and a page for the slide, a page for the hold and three beats of
 * fill do not fit in six. Sliding under them while they are still arriving
 * is what "first" means on the wave anyway.
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
    { tick: 90, control: "cannon", col: 3 },
    { tick: 120, control: "cannon", col: 2 },
    // Held to the last tick of the film: `until` past `ticks` is a thumb that
    // is still there when the loop comes round, which is what this page is.
    { tick: 630, control: "fireCyan", until: 1080 },
  ],
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "GET UNDER THEM FIRST",
      anchor: { at: "control", control: "cannon" },
    },
    // Holds nine beats in, with the three on rows six, seven and eight.
    { tick: 240, seat: 2, text: "THREE CYAN, ONE COLUMN", anchor: { at: "body" } },
    {
      tick: 540,
      seat: 2,
      text: "HOLD IT · DO NOT TAP",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 840,
      seat: 1,
      text: "THE BEAM TAKES ALL THREE",
      anchor: { at: "body" },
    },
  ],
};

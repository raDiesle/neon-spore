import type { GuideScene } from "../scene-types.js";

/**
 * THE RIND's rehearsal: the shot that lands does not close the column.
 *
 * Three times the size of an ordinary body, and the matching colour only takes
 * a layer off it. Every wave before this one has taught the pair that a hit is
 * the end of a body, so the lesson is not what to fire — they already know the
 * colour, it has been showing since it arrived — but that they are not
 * finished, and that moving off after the first shot is how a pair pays for
 * the same body twice.
 *
 * So the cannon is carried to it on its own page and then never moves again,
 * and the last page is the count: *three, two, one*, said out loud, so both of
 * them know which shot is the last one. Each `rindShed` in the film is the
 * simulation's own — the body really is a size smaller after each one.
 */
export const THE_RIND: GuideScene = {
  ticks: 1020,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 5, kind: "rind", color: "red" }],
  acts: [
    { tick: 330, control: "cannon", col: 3 },
    { tick: 360, control: "cannon", col: 4 },
    { tick: 390, control: "cannon", col: 5 },
    { tick: 590, control: "fireRed" },
    { tick: 700, control: "fireRed" },
    { tick: 850, control: "fireRed" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "RIND · THREE LAYERS", anchor: { at: "body" } },
    {
      tick: 240,
      seat: 1,
      text: "STAY UNDER IT · ALL THREE",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 500,
      seat: 2,
      text: "SAME COLOUR, THREE TIMES",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 760,
      seat: 2,
      text: "COUNT THEM DOWN OUT LOUD",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};

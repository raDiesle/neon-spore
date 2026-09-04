import type { GuideScene } from "../scene-types.js";

/**
 * THE GHOST's rehearsal: waiting to see it is the miss.
 *
 * Something is falling that only one of the two screens draws. The other gets
 * a band across the row it is in and nothing at all about the column — so the
 * column is a number one of them has to say out loud, and the other has to be
 * standing in it before it arrives.
 *
 * The first two pages are the same instant on the two phones and they are the
 * whole wave: a body on hers, an empty column with a band across it on his.
 * The caption on his page is drawn round the place the body is and does not
 * draw the body, because that is exactly the picture he has — the ring is
 * round nothing, and the nothing is the lesson.
 */
export const THE_GHOST: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 5, kind: "ghost", color: "cyan" }],
  acts: [
    { tick: 570, control: "cannon", col: 4 },
    { tick: 600, control: "cannon", col: 5 },
    { tick: 810, control: "fireCyan" },
  ],
  steps: [
    { tick: 0, seat: 2, text: "ONLY PLAYER 2 SEES IT", anchor: { at: "body" } },
    { tick: 240, seat: 1, text: "PLAYER 1 GETS A ROW", anchor: { at: "body" } },
    {
      tick: 480,
      seat: 1,
      text: "PLAYER 1 TAKES THE COLUMN",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 720,
      seat: 2,
      text: "PLAYER 2 FIRES CYAN",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};

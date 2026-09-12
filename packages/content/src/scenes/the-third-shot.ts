import type { GuideScene } from "../scene-types.js";

/**
 * THE SHELL's rehearsal: the shot that worked twice is the miss.
 *
 * A slick or a bulb in plating a size too big for it, split down the middle —
 * one piece in front of each of its two columns, with the body's own colour
 * showing through the cracks. Any colour chips a piece off. Only when both are
 * gone does that colour finish it, and a shot up the column whose piece has
 * already gone does nothing at all.
 *
 * The film is the two columns and then the colour: he stands under one piece,
 * she chips it, he moves to the other, she chips that, and then the colour
 * everyone could see the whole way down finally lands. Every event in it is
 * the simulation's — two `shellBreak`s, a `shellBare`, and a `destroy`.
 *
 * **The column it is authored in is not decoration.** Waves are written in
 * seven columns and played on eleven, so most real columns cannot be named by
 * an author at all — and a shell covers two *adjacent* ones. Authored column 4
 * is the placement whose two halves are both columns the cannon can be sent
 * to, which is what lets the film show the move from one piece to the other
 * rather than describing it.
 */
export const THE_THIRD_SHOT: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 4, kind: "shell", color: "cyan" }],
  acts: [
    { tick: 510, control: "cannon", col: 4 },
    // The two chips sit a beat apart with the slide between them, closer than
    // the other films press, because the shell is on row eleven by now and
    // the finishing shot on the next page has to land before it reaches the
    // hull.
    { tick: 690, control: "fireRed" },
    { tick: 720, control: "cannon", col: 5 },
    { tick: 750, control: "fireRed" },
    { tick: 870, control: "fireCyan" },
  ],
  steps: [
    // Seven beats: the shell holds on row six, in the middle of the screen,
    // and not lower because three shots still have to land under it.
    { tick: 0, seat: 1, text: "SHELL · A PIECE EACH SIDE", anchor: { at: "body" } },
    {
      tick: 420,
      seat: 1,
      text: "ONE PIECE, ONE COLUMN",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 600,
      seat: 2,
      text: "ANY COLOUR CHIPS ONE OFF",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 780,
      seat: 2,
      text: "ITS OWN COLOUR FINISHES IT",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};

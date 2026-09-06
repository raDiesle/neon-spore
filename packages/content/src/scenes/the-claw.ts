import type { GuideScene } from "../scene-types.js";

/**
 * THE CLAW's rehearsal: the gun is a hand, and neither of you can work it
 * alone.
 *
 * The field is the ordinary field — the same grid, the same hull, rocks coming
 * down it exactly as they always do — and that is the first thing the film has
 * to establish, because everything else about this panel is a small change to
 * something the pair already knows. The strip is the strip. What is different
 * is that the swelling on the end of it is an arm, and that the power-ups are
 * on one screen only and crossing sideways rather than hanging still.
 *
 * So the pages go: *the cannon is an arm*, *a power-up crosses*, then the
 * slide, the reach, and the mouth. The last two are the catch split between
 * the two seats, which is the whole panel in one gesture — he can bring a
 * thing down and cannot take it in, and she can take it in and cannot reach
 * for anything.
 *
 * **The film reaches ahead of the pod, not at it.** A crossing power-up is at
 * a different column by the time the arm gets up there, and a rehearsal that
 * put the arm where the thing currently was would teach the one habit this
 * panel punishes. The slide goes to the column it is *travelling into*, which
 * is what player 2 actually has to say out loud.
 *
 * **And nothing is fired.** There is no trigger on this panel at all: the rock
 * that comes down beside the catch is not answered, it is simply not reached
 * into — and reaching into it would make it *worse*, because a body the arm
 * closes on is dropped and arrives like a torch. That is the difference
 * between evading a thing and shooting it.
 */
export const THE_CLAW: GuideScene = {
  ticks: 1040,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 6, col: 6, kind: "meteor", color: null }],
  // One power-up, crossing left to right along row four, on player 2's screen
  // and nobody else's — the wave's own arrangement, in miniature.
  pods: [{ beat: 0, col: 0, row: 4, kind: "mend", cross: 1 }],
  acts: [
    { tick: 400, control: "cannon", col: 3 },
    { tick: 600, control: "reach" },
    { tick: 900, control: "mawTake" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "THE CANNON IS AN ARM", anchor: { at: "hull" } },
    { tick: 200, seat: 2, text: "A POD CROSSES THE FIELD", anchor: { at: "hull" } },
    {
      tick: 390,
      seat: 1,
      text: "SLIDE AHEAD OF IT",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 580,
      seat: 1,
      text: "REACH, AND IT IS COMMITTED",
      anchor: { at: "control", control: "reach" },
    },
    {
      tick: 790,
      seat: 2,
      text: "PLAYER 2 OPENS THE MOUTH",
      anchor: { at: "control", control: "mawTake" },
    },
  ],
};

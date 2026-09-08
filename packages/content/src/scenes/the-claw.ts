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
 * slide, the reach, the winding and the mouth. The last three are the catch
 * split between the two seats, which is the whole panel in three gestures — he
 * can bring a thing down and cannot take it in, and she can take it in and
 * cannot reach for anything.
 *
 * **The arm does not come back on its own, and the film has to say so.** The
 * page after the reach is the crank: the hand goes on it and stays there,
 * turning, while the arm comes down the column with the thing it took
 * (`sim/crank.ts`). It is the longest page here on purpose — what the pair has
 * to learn is that a press is not the end of the gesture, and a page that
 * flicked the arm home in half a second would teach the opposite.
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
  ticks: 1360,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 10, col: 6, kind: "meteor", color: null }],
  // One power-up, crossing left to right along row four, on player 2's screen
  // and nobody else's — the wave's own arrangement, in miniature.
  pods: [{ beat: 3, col: 0, row: 4, kind: "mend", cross: 1, speed: 1 }],
  acts: [
    { tick: 480, control: "cannon", col: 5 },
    { tick: 660, control: "reach" },
    // The winding, in two goes, which is what it is: the hand goes on the
    // crank and turns it, and the rope comes in for as long as it does.
    //
    // The first go is player 1's page and brings the arm half way down. The
    // second is under **player 2's** page, where his hand is not drawn at all
    // — she cannot see it, she can only see the arm coming and the moment it
    // is going to arrive, which is exactly the sentence this panel is about.
    { tick: 870, control: "crank", until: 900 },
    { tick: 1040, control: "crank", until: 1150 },
    { tick: 1070, control: "mawTake" },
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
      tick: 780,
      seat: 1,
      text: "PLAYER 1 WINDS IT BACK",
      anchor: { at: "control", control: "crank" },
    },
    {
      tick: 1070,
      seat: 2,
      text: "PLAYER 2 OPENS THE MOUTH",
      anchor: { at: "control", control: "mawTake" },
    },
  ],
};

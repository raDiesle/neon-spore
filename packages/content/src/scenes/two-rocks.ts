import type { GuideScene } from "../scene-types.js";

/**
 * TWO ROCKS' rehearsal: the plate becomes something player 2 can carry.
 *
 * This choreography was THE ROCK's, and it moved a wave later along with the
 * control it is about. THE ROCK is played on STANDARD 3, where the trigger
 * exists and the strip under the plate does not — so its rock arrives in the
 * column the plate already stands in, and the whole of the lesson is *when*.
 * The strip arrives here, on STANDARD 4, and with it the sentence the game is
 * built on: player 2 slides it into the column and cannot fire it, player 1
 * fires it and cannot move it.
 *
 * **The trigger waits, and the waiting is still the lesson.** *Trigger the
 * shield at the moment it lands — not before.* So the last page opens, holds a
 * still field for nearly two seconds while the rock comes down, and only then
 * does the hand go to the lobe. Every other page in every other film puts its
 * press a beat and a half in; this one is late deliberately, because a page
 * that triggered early would be teaching the failure the wave is built around.
 */
export const TWO_ROCKS: GuideScene = {
  ticks: 960,
  bpm: 120,
  seed: 1,
  // Authored at column 5 rather than at the middle so the shield has somewhere
  // to travel from: a drag that is already where it is going draws nothing.
  entries: [{ beat: 0, col: 5, kind: "meteor", color: null }],
  acts: [
    { tick: 330, control: "shield", col: 3 },
    { tick: 360, control: "shield", col: 4 },
    { tick: 390, control: "shield", col: 5 },
    { tick: 850, control: "guard" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "ROCK · CANNOT BE SHOT", anchor: { at: "body" } },
    {
      tick: 240,
      seat: 2,
      text: "PLAYER 2 CARRIES THE PLATE",
      anchor: { at: "control", control: "shield" },
    },
    {
      tick: 660,
      seat: 1,
      text: "PLAYER 1 FIRES THE SHIELD",
      anchor: { at: "control", control: "guard" },
    },
  ],
};

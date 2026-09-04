import type { GuideScene } from "../scene-types.js";

/**
 * THE CLASP's rehearsal: the shield opens the enemy instead of stopping it.
 *
 * Everything before this wave points the ward *down* — at a rock, to keep it
 * off the hull. A clasp is the same two halves aimed the other way: a body
 * inside a shield of its own that no shot can reach, and the only thing that
 * opens one is the ward fired up the field at it. What is left is an ordinary
 * body in the colour that has been showing through the cracks the whole way
 * down, and it still has to be shot.
 *
 * So the film is four pages and the middle two are the coupling: her column,
 * his trigger, neither worth anything alone. The last one is the ordinary
 * thing the pair already knows how to do, which is the point — a clasp is not
 * a new enemy, it is a lock in front of one.
 *
 * **Nothing is where it starts.** The clasp is authored two columns left of
 * where both the cannon and the shield stand, so the film shows the shield
 * being carried to it and then the cannon being carried after it. A wave
 * authored under the two controls' resting places would have taught the
 * mechanic with everything already in position, which is the one arrangement
 * a real wave never hands anybody.
 */
export const THE_CLASP: GuideScene = {
  ticks: 960,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 2, kind: "clasp", color: "cyan" }],
  acts: [
    { tick: 290, control: "shield", col: 3 },
    { tick: 320, control: "shield", col: 2 },
    { tick: 350, control: "shield", col: 2 },
    { tick: 480, control: "cannon", col: 3 },
    { tick: 510, control: "cannon", col: 2 },
    { tick: 600, control: "guard" },
    { tick: 750, control: "fireCyan" },
  ],
  steps: [
    { tick: 0, seat: 2, text: "CLASP · SHOTS BOUNCE OFF", anchor: { at: "body" } },
    {
      tick: 200,
      seat: 2,
      text: "PLAYER 2 HOLDS THE COLUMN",
      anchor: { at: "control", control: "shield" },
    },
    // The cannon travels on this page too. It is player 1's hand either way,
    // and it is one movement to a person: he goes to the column and then to
    // the trigger, which is the order the wave asks for.
    {
      tick: 390,
      seat: 1,
      text: "THE WARD OPENS IT",
      anchor: { at: "control", control: "guard" },
    },
    {
      tick: 660,
      seat: 2,
      text: "NOW THE COLOUR LANDS",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};

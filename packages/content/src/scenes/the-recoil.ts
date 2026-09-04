import type { GuideScene } from "../scene-types.js";

/**
 * THE RECOIL's rehearsal: your own shot is what makes the call wrong.
 *
 * A body in a sprung cage. The matching colour does not kill it — it throws it
 * two rows back up the field and a lane to one side, and the body inside turns
 * over to the other colour on the way. So a hit undoes both halves of what the
 * pair just agreed, his column and her trigger, at the same instant and by
 * their own doing.
 *
 * The film is that once and then again, because once could look like a fluke.
 * It does not kill the thing: every bounce pushes it back up the field, so
 * three cages' worth does not fit inside one loop, and it does not need to —
 * the lesson is the two seconds after a hit, and the film ends inside the
 * second one.
 *
 * **The seed is a measurement, and so is the column.** Which lane a cage
 * bounces to is drawn from the seeded rng, and most of the field cannot be
 * named by an author at all — seed 3 is the one whose first bounce lands on a
 * column the cannon can be sent to. `test/scenes.test.ts` runs the film to its
 * last tick, so a bounce that changed direction under it would fail rather
 * than quietly leave the cannon standing in an empty lane.
 */
export const THE_RECOIL: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 3,
  entries: [{ beat: 0, col: 5, kind: "recoil", color: "red" }],
  acts: [
    { tick: 150, control: "cannon", col: 4 },
    { tick: 180, control: "cannon", col: 5 },
    { tick: 330, control: "fireRed" },
    { tick: 550, control: "cannon", col: 4 },
    { tick: 770, control: "fireCyan" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "RECOIL · IN A SPRUNG CAGE", anchor: { at: "body" } },
    {
      tick: 240,
      seat: 2,
      text: "YOUR SHOT THROWS IT BACK",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 460,
      seat: 1,
      text: "IT LANDS A LANE OVER",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 680,
      seat: 2,
      text: "AND THE COLOUR FLIPPED",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};

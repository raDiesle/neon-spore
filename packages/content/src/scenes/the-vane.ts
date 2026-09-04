import type { GuideScene } from "../scene-types.js";

/**
 * THE VANE's rehearsal: the column you were told is never the column it lands
 * in.
 *
 * An arm sweeps the top of the field, and everything that comes in under it is
 * folded about the column it is standing in — as far the other side of the arm
 * as it came in. Both screens still say where a body was *aimed*; neither says
 * where it will be, and the arithmetic is the same on both, which is why this
 * is the one boss in the game whose wave is otherwise an ordinary wave.
 *
 * So the film shows one arrival being folded right across the field and the
 * cannon walking to where it came out. The fold is the boss's own — nothing
 * here places the body, it is authored at the column an author would have
 * written and the arm does the rest.
 *
 * **Authored column 4 is a measurement.** It is the arrival whose fold lands on
 * a column the cannon can be sent to at all: waves are written in seven columns
 * and played on eleven, so most of the field cannot be named by an author, and
 * a fold that landed on one of those would be a film that could not finish its
 * own sentence.
 */
export const THE_VANE: GuideScene = {
  ticks: 900,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 4, color: "red" }],
  boss: { kind: "vane" },
  acts: [
    { tick: 330, control: "cannon", col: 2 },
    { tick: 370, control: "cannon", col: 1 },
    { tick: 410, control: "cannon", col: 0 },
    { tick: 590, control: "fireRed" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "THE ARM FOLDS WHAT ENTERS", anchor: { at: "body" } },
    {
      tick: 240,
      seat: 1,
      text: "COUNT FROM THE ARM",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 500,
      seat: 2,
      text: "PLAYER 2 FIRES RED",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};

import type { GuideScene } from "../scene-types.js";

/**
 * THE COUNT's rehearsal: the shot that is right in every way but its moment.
 *
 * A count shuts one blade a beat and is open only on zero, and only player 1
 * is drawn the blades — player 2 is drawn an eye that never blinks
 * (`sim/countdown.ts`). So the wave's sentence comes out of the pilot's mouth
 * and the trigger is the navigator's, and the film is the two halves of it on
 * the two screens they live on.
 *
 * **Both shots are real.** The first is red into a red body in its own column,
 * the reflex every wave before this one rewarded, fired on a beat with marks
 * still up: `countdownStruck` refuses it and shuts the body grey for
 * `countdownShutBeats`. The second is the same trigger on a zero after the
 * shut has run out, and it lands. The phase is rolled off the seed on the beat
 * the body enters (`countdownOnSpawn`), so the ticks below are written against
 * what seed 1 rolls, and `test/scene-count.test.ts` says so if it changes.
 *
 * Column 3 is where the cannon already stands, so there is no aiming in it:
 * the column is not the lesson here, the beat is.
 */
export const THE_COUNT: GuideScene = {
  ticks: 1020,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 3, kind: "countdown", color: "red" }],
  acts: [
    { tick: 510, control: "fireRed" },
    { tick: 850, control: "fireRed" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "PLAYER 1 SEES THE BLADES", anchor: { at: "body" } },
    { tick: 420, seat: 2, text: "FIRING ON SIGHT SHUTS IT", anchor: { at: "body" } },
    { tick: 600, seat: 1, text: "PLAYER 1 COUNTS DOWN ALOUD", anchor: { at: "body" } },
    {
      tick: 780,
      seat: 2,
      text: "PLAYER 2 FIRES ON ZERO",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};

import type { GuideScene } from "../scene-types.js";

/**
 * HEAVY ROCKS' rehearsal: a rock that falls faster is the same rock, with less
 * time to be under it.
 *
 * This was THE WARD's film until 16 October 2026, a pod that held the shield
 * armed with nobody pressing the trigger. The owner rejected the ward pod that
 * day; the wave stayed for the four faster rocks it brought in, and the film
 * kept its name (`theWard`, as the wave kept its id) and lost its pod.
 *
 * One rock and it is a fast one, so the page that matters is the second: the
 * shield is carried into the column *before* the rock is anywhere near it,
 * because at three rows a beat there is no time left to start moving once it
 * is close. Then the trigger, late, as THE ROCK taught it.
 */
export const THE_WARD: GuideScene = {
  ticks: 960,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 8, col: 5, kind: "meteorFast", color: null }],
  acts: [
    { tick: 420, control: "shield", col: 5 },
    { tick: 450, control: "shield", col: 5 },
    { tick: 800, control: "guard" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "ROCKS · FIVE SPEEDS", anchor: { at: "ship", control: "guard" } },
    {
      tick: 300,
      seat: 2,
      text: "BE UNDER IT EARLY",
      anchor: { at: "control", control: "shield" },
    },
    {
      tick: 600,
      seat: 1,
      text: "FIRE IT AS IT LANDS",
      anchor: { at: "control", control: "guard" },
    },
  ],
};

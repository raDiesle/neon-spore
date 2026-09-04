import type { GuideScene } from "../scene-types.js";

/**
 * CYAN's rehearsal: the second button, on its own.
 *
 * FIRST STEP is played on STANDARD 1, where player 2 has red and nothing else,
 * and this is the wave that hands them the other one — so the film is the
 * first film again with one thing changed, which is the whole of what a rung
 * of the ladder is for (`control-sets-table.ts`). The cannon still goes under
 * the column, the other seat still fires; what is new is that there is now a
 * choice about *what* leaves it, and the body says which.
 *
 * **The wrong colour is not shown here, and that is deliberate.** Spending red
 * on a bulb is TWO COLOURS' subject two waves later, on a panel that has held
 * both for a while — a pair being handed a button for the first time is shown
 * it working. Three pages: the body, the column, the colour.
 */
export const CYAN: GuideScene = {
  ticks: 990,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 5, color: "cyan" }],
  // A beat and a half after the page that asks for it, the way every film in
  // act one is timed: the words arrive, then the hand does.
  acts: [
    { tick: 330, control: "cannon", col: 3 },
    { tick: 360, control: "cannon", col: 4 },
    { tick: 390, control: "cannon", col: 5 },
    { tick: 690, control: "fireCyan" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "BULB · ALWAYS CYAN", anchor: { at: "body" } },
    {
      tick: 240,
      seat: 1,
      text: "PLAYER 1 MOVES CANNON",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 600,
      seat: 2,
      text: "PLAYER 2 FIRES CYAN",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};

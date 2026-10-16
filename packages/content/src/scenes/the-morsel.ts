import type { GuideScene } from "../scene-types.js";

/**
 * THE MORSEL's rehearsal: the shot that lands is only half the answer.
 *
 * One body and the three moments it is owed, each on the seat that owes it:
 * the pilot stands the cannon under it, the navigator's shot turns it limp
 * rather than taking it off the field, and then it is the pilot's again — the
 * maw, open as it lands (`sim/morsel.ts`). What the film must not do is end
 * on the shot: that is the reflex the creature exists to punish, a pair who
 * see a hit land and stop watching.
 *
 * **The cannon is parked a column off, and the body comes to it.** A limp
 * morsel steers at the cannon on the last stretch, the freed pod's own
 * assist, so the pilot's lesson is to be near and open rather than exactly
 * right — SALVAGE's, said again on a body.
 */
export const THE_MORSEL: GuideScene = {
  ticks: 1200,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 1, col: 2, kind: "morsel", color: "red" }],
  acts: [
    { tick: 90, control: "cannon", col: 2 },
    { tick: 390, control: "fireRed" },
    // A column over once it is down: the steer brings it back in.
    { tick: 690, control: "cannon", col: 3 },
    { tick: 960, control: "intake" },
  ],
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "PLAYER 1 MOVES CANNON",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 300,
      seat: 2,
      text: "A HIT ONLY MAKES IT LIMP",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 600,
      seat: 1,
      text: "LIMP · OPEN AS IT LANDS",
      anchor: { at: "control", control: "intake" },
    },
  ],
};

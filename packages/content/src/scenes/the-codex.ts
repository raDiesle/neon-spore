import type { GuideScene } from "../scene-types.js";

/**
 * THE CODEX's rehearsal: the button that works and lies.
 *
 * The fault changes what a colour kills rather than taking a control away —
 * red kills what cyan should and cyan what red should — and the key turns over
 * every `codexHoldBeats`, opening swapped (`sim/codex.ts`). Only the pilot is
 * drawn the shimmer that says so (`render/codex.ts`), and only the navigator
 * can fire. So `faults` is authored on the film the way it is on the wave, THE
 * JAM's reason, and every tick below is written against the key's own clock:
 * swapped for the first four beats, clear for the next four, swapped again.
 *
 * **The first page is the pilot's**, long enough to see the shimmer on and
 * then gone. Then the navigator's reflex — red into a red body in its own
 * column, fired in the second swapped hold — and the body refuses it. Then the
 * same hold, the same body, and the other button: cyan, because the pilot
 * said so, and it lands.
 *
 * Column 3 is where the cannon already stands, so there is no aiming in it:
 * the column is not the lesson here, the key is. `test/scene-codex.test.ts`
 * holds both shots inside the swapped hold, where a retimed press would quietly
 * turn the lie into an ordinary miss.
 */
export const THE_CODEX: GuideScene = {
  ticks: 960,
  bpm: 120,
  seed: 1,
  faults: [{ kind: "codex" }],
  entries: [{ beat: 0, col: 3, color: "red" }],
  acts: [
    { tick: 555, control: "fireRed" },
    { tick: 735, control: "fireCyan" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "ONLY PLAYER 1 SEES THE SWAP", anchor: { at: "body" } },
    { tick: 465, seat: 2, text: "RED ON RED IS REFUSED", anchor: { at: "body" } },
    {
      tick: 645,
      seat: 2,
      text: "FIRE WHAT PLAYER 1 SAYS",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};

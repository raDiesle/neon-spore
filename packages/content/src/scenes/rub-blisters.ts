import type { GuideScene } from "../scene-types.js";

/**
 * RUB MEMORY's rehearsal: a RUB blister in each of its three bodies —
 * WASHBOARD and URCHIN for the pilot, then PURR, the cat, for the navigator
 * (`render/blister-rub.ts`, picked by id). The finger scrubs back and forth
 * over the drop, and the turning back is the blow.
 *
 * A film of the controls family (`scenes-controls.ts`): the hand on each body
 * is `SceneAct.blister`, and what it does is the arrival's gesture, drawn as
 * a hand doing it (`render/guide-finger.ts`).
 */
export const RUB_BLISTERS: GuideScene = {
  ticks: 960,
  bpm: 120,
  seed: 3,
  entries: [
    { beat: 0, col: 1, kind: "blister", color: null, row: 6, by: 1, gesture: "rub" },
    { beat: 0, col: 4, kind: "blister", color: null, row: 6, by: 1, gesture: "rub" },
    { beat: 9, col: 3, kind: "blister", color: null, row: 7, by: 2, gesture: "rub" },
  ],
  acts: [
    { tick: 270, blister: 1, col: 1 },
    { tick: 370, blister: 1, col: 4 },
    { tick: 810, blister: 2, col: 3 },
  ],
  steps: [
    { tick: 0, seat: 2, text: "THEY SWELL HERE: SAY WHERE", anchor: { at: "body" } },
    { tick: 180, seat: 1, text: "PLAYER 1 RUBS EACH ONE", anchor: { at: "body" } },
    { tick: 540, seat: 1, text: "IT SWELLS HERE: SAY WHERE", anchor: { at: "body" } },
    { tick: 720, seat: 2, text: "PLAYER 2 RUBS THIS ONE", anchor: { at: "body" } },
  ],
};

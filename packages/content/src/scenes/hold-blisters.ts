import type { GuideScene } from "../scene-types.js";

/**
 * HOLD WANDERER's rehearsal: a HOLD blister in each of its two bodies, PALM
 * then HUG (`render/blister-bodies.ts` `drawHoldBody`, picked by the body and
 * its tile), each held for its one beat — the drop filling under the finger
 * and the green ring while it counts. The pilot holds the first, the
 * navigator the second.
 *
 * A film of the controls family (`scenes-controls.ts`): the hand on each body
 * is `SceneAct.blister`, and what it does is the arrival's gesture, drawn as
 * a hand doing it (`render/guide-finger.ts`).
 */
export const HOLD_BLISTERS: GuideScene = {
  ticks: 840,
  bpm: 120,
  seed: 3,
  entries: [
    { beat: 0, col: 1, kind: "blister", color: null, row: 7, by: 1, gesture: "hold" },
    { beat: 7, col: 4, kind: "blister", color: null, row: 7, by: 2, gesture: "hold" },
  ],
  acts: [
    { tick: 270, blister: 1, col: 1 },
    { tick: 690, blister: 2, col: 4 },
  ],
  steps: [
    { tick: 0, seat: 2, text: "IT SWELLS HERE: SAY WHERE", anchor: { at: "body" } },
    { tick: 180, seat: 1, text: "PLAYER 1 HOLDS IT A BEAT", anchor: { at: "body" } },
    { tick: 420, seat: 1, text: "IT SWELLS HERE: SAY WHERE", anchor: { at: "body" } },
    { tick: 600, seat: 2, text: "PLAYER 2 HOLDS THIS ONE", anchor: { at: "body" } },
  ],
};

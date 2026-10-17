import type { GuideScene } from "../scene-types.js";

/**
 * TWISTED COMBO's rehearsal: a COMBO blister in each of its two bodies,
 * CURL for the pilot and BUD for the navigator (`render/blister-combo.ts`,
 * picked by id). The finger presses the drop, lifts, and strokes the pull
 * that comes in where it was, to the right.
 *
 * A film of the controls family (`scenes-controls.ts`): the hand on each body
 * is `SceneAct.blister`, and what it does is the arrival's gesture, drawn as
 * a hand doing it (`render/guide-finger.ts`).
 */
export const COMBO_BLISTERS: GuideScene = {
  ticks: 960,
  bpm: 120,
  seed: 3,
  entries: [
    { beat: 0, col: 2, kind: "blister", color: null, row: 6, by: 1, gesture: "combo" },
    { beat: 9, col: 3, kind: "blister", color: null, row: 7, by: 2, gesture: "combo" },
  ],
  acts: [
    { tick: 270, blister: 1, col: 2 },
    { tick: 810, blister: 2, col: 3 },
  ],
  steps: [
    { tick: 0, seat: 2, text: "IT SWELLS HERE: SAY WHERE", anchor: { at: "body" } },
    { tick: 180, seat: 1, text: "PLAYER 1 TAPS, THEN SWIPES", anchor: { at: "body" } },
    { tick: 540, seat: 1, text: "IT SWELLS HERE: SAY WHERE", anchor: { at: "body" } },
    { tick: 720, seat: 2, text: "PLAYER 2 TAPS, THEN SWIPES", anchor: { at: "body" } },
  ],
};

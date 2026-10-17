import type { GuideScene } from "../scene-types.js";

/**
 * TURN's rehearsal: a TURN blister in each of its bodies and each way
 * round — WHEEL clockwise and SNAIL anticlockwise for the navigator, then
 * WHEEL anticlockwise for the pilot (`render/blister-bodies.ts`
 * `drawTurnBody`, picked by the body and its tile). The finger goes once
 * round the ring the way its channel runs.
 *
 * A film of the controls family (`scenes-controls.ts`): the hand on each body
 * is `SceneAct.blister`, and what it does is the arrival's gesture, drawn as
 * a hand doing it (`render/guide-finger.ts`).
 */
export const TURN_BLISTERS: GuideScene = {
  ticks: 960,
  bpm: 120,
  seed: 3,
  entries: [
    { beat: 0, col: 1, kind: "blister", color: null, row: 7, by: 2, gesture: "turn" },
    { beat: 0, col: 5, kind: "blister", color: null, row: 7, by: 2, gesture: "turn", way: "ccw" },
    { beat: 9, col: 3, kind: "blister", color: null, row: 6, by: 1, gesture: "turn", way: "ccw" },
  ],
  acts: [
    { tick: 270, blister: 2, col: 1 },
    { tick: 370, blister: 2, col: 5 },
    { tick: 810, blister: 1, col: 3 },
  ],
  steps: [
    { tick: 0, seat: 1, text: "THEY SWELL HERE: SAY WHERE", anchor: { at: "body" } },
    { tick: 180, seat: 2, text: "PLAYER 2 TURNS EACH ROUND", anchor: { at: "body" } },
    { tick: 540, seat: 2, text: "IT SWELLS HERE: SAY WHERE", anchor: { at: "body" } },
    { tick: 720, seat: 1, text: "PLAYER 1 TURNS IT ROUND", anchor: { at: "body" } },
  ],
};

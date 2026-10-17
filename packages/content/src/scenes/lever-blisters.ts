import type { GuideScene } from "../scene-types.js";

/**
 * LEVER FURY's rehearsal: a LEVER blister in each of its three bodies —
 * ROOT and BELL for the navigator, then TAFFY for the pilot
 * (`render/blister-lever.ts`, picked by id). The finger carries the knob down
 * its groove into the band and holds it there while the dial fills.
 *
 * A film of the controls family (`scenes-controls.ts`): the hand on each body
 * is `SceneAct.blister`, and what it does is the arrival's gesture, drawn as
 * a hand doing it (`render/guide-finger.ts`).
 */
export const LEVER_BLISTERS: GuideScene = {
  ticks: 960,
  bpm: 120,
  seed: 3,
  entries: [
    { beat: 0, col: 1, kind: "blister", color: null, row: 6, by: 2, gesture: "lever" },
    { beat: 0, col: 4, kind: "blister", color: null, row: 6, by: 2, gesture: "lever" },
    { beat: 9, col: 3, kind: "blister", color: null, row: 7, by: 1, gesture: "lever" },
  ],
  acts: [
    { tick: 270, blister: 2, col: 1 },
    { tick: 390, blister: 2, col: 4 },
    { tick: 810, blister: 1, col: 3 },
  ],
  steps: [
    { tick: 0, seat: 1, text: "THEY SWELL HERE: SAY WHERE", anchor: { at: "body" } },
    { tick: 180, seat: 2, text: "PLAYER 2 PULLS AND HOLDS", anchor: { at: "body" } },
    { tick: 540, seat: 2, text: "IT SWELLS HERE: SAY WHERE", anchor: { at: "body" } },
    { tick: 720, seat: 1, text: "PLAYER 1 PULLS AND HOLDS", anchor: { at: "body" } },
  ],
};

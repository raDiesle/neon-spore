import type { GuideScene } from "../scene-types.js";

/**
 * SWIPE's rehearsal: all four ways a SWIPE blister's arrow points —
 * up and right for the pilot, down and left for the navigator — across both
 * its bodies, ZIP and SLUG in turn (`render/blister-swipe-body.ts`). The
 * finger strokes each the way its arrow says, as far as the channel runs.
 *
 * A film of the controls family (`scenes-controls.ts`): the hand on each body
 * is `SceneAct.blister`, and what it does is the arrival's gesture, drawn as
 * a hand doing it (`render/guide-finger.ts`).
 */
export const SWIPE_BLISTERS: GuideScene = {
  ticks: 1020,
  bpm: 120,
  seed: 3,
  entries: [
    { beat: 0, col: 1, kind: "blister", color: null, row: 8, by: 1, gesture: "swipe", way: "up" },
    {
      beat: 0,
      col: 4,
      kind: "blister",
      color: null,
      row: 6,
      by: 1,
      gesture: "swipe",
      way: "right",
    },
    { beat: 9, col: 2, kind: "blister", color: null, row: 6, by: 2, gesture: "swipe", way: "down" },
    { beat: 9, col: 5, kind: "blister", color: null, row: 8, by: 2, gesture: "swipe", way: "left" },
  ],
  acts: [
    { tick: 270, blister: 1, col: 1 },
    { tick: 350, blister: 1, col: 4 },
    { tick: 810, blister: 2, col: 2 },
    { tick: 890, blister: 2, col: 5 },
  ],
  steps: [
    { tick: 0, seat: 2, text: "THEY SWELL HERE: SAY WHERE", anchor: { at: "body" } },
    { tick: 180, seat: 1, text: "PLAYER 1 SWIPES THE ARROW", anchor: { at: "body" } },
    { tick: 540, seat: 1, text: "THEY SWELL HERE: SAY WHERE", anchor: { at: "body" } },
    { tick: 720, seat: 2, text: "PLAYER 2 SWIPES THE ARROW", anchor: { at: "body" } },
  ],
};

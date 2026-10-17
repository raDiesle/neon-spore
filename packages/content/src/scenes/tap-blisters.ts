import type { GuideScene } from "../scene-types.js";

/**
 * TAP SCATTER's rehearsal: a TAP blister in each of its three bodies — RIDER,
 * MOLE and CRADLE, picked by id (`render/blister-tap-body.ts`) — and each
 * seat the hand once. The pilot says where two swell and the navigator taps
 * both; then the other way round, for the third.
 *
 * A film of the controls family (`scenes-controls.ts`): the hand on each body
 * is `SceneAct.blister`, and what it does is the arrival's gesture, drawn as
 * a hand doing it (`render/guide-finger.ts`).
 */
export const TAP_BLISTERS: GuideScene = {
  ticks: 840,
  bpm: 120,
  seed: 3,
  entries: [
    { beat: 0, col: 1, kind: "blister", color: null, row: 6, by: 2 },
    { beat: 0, col: 4, kind: "blister", color: null, row: 6, by: 2 },
    { beat: 7, col: 3, kind: "blister", color: null, row: 7, by: 1 },
  ],
  acts: [
    { tick: 270, blister: 2, col: 1 },
    { tick: 330, blister: 2, col: 4 },
    { tick: 690, blister: 1, col: 3 },
  ],
  steps: [
    { tick: 0, seat: 1, text: "THEY SWELL HERE: SAY WHERE", anchor: { at: "body" } },
    { tick: 180, seat: 2, text: "PLAYER 2 TAPS EACH ONE", anchor: { at: "body" } },
    { tick: 420, seat: 2, text: "IT SWELLS HERE: SAY WHERE", anchor: { at: "body" } },
    { tick: 600, seat: 1, text: "PLAYER 1 TAPS THIS ONE", anchor: { at: "body" } },
  ],
};

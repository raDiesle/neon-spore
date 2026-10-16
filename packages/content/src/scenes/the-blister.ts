import type { GuideScene } from "../scene-types.js";

/**
 * THE BLISTER's rehearsal: the talking it is for, in two pages
 * (`docs/spec/blister.md`, *In one sentence*). One blister, the navigator's
 * to knock down with one tap, and the pilot the seat that sees the pore swell
 * before it comes up.
 *
 * 1. The pilot's screen, the pore swelling on beat 2: *say where*.
 * 2. The navigator's: called early, the thumb is on it a beat after it
 *    surfaces, and the one tap knocks it out.
 *
 * Until 15 October 2026 the film took three taps and a sinking between them;
 * the owner: *once player executed correct, it should not appear again*. A
 * blister still up when its beats run out breaks the hull and loses the
 * wave, and no page shows that — the film would end on a lost wave.
 *
 * The tap names the body by its column (`SceneAct.tap`), and lands inside
 * the six beats it is up (`scene-blister.test.ts`).
 */
export const THE_BLISTER: GuideScene = {
  ticks: 420,
  bpm: 120,
  seed: 3,
  entries: [{ beat: 0, col: 3, kind: "blister", color: null, row: 6, by: 2 }],
  acts: [{ tick: 270, tap: true, col: 3 }],
  steps: [
    { tick: 0, seat: 1, text: "IT SWELLS HERE: SAY WHERE", anchor: { at: "body" } },
    { tick: 180, seat: 2, text: "PLAYER 2 TAPS IT ONCE", anchor: { at: "body" } },
  ],
};

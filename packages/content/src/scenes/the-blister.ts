import type { GuideScene } from "../scene-types.js";

/**
 * THE BLISTER's rehearsal, at its plainest: one blister, the navigator's to
 * knock down, tapped out on its first surfacing (`sim/blister.ts`).
 *
 * The pilot's page first, because the pilot is the seat that sees where it
 * comes up; then the navigator's, with three taps while it is up. The taps
 * name the body by the column it was authored in (`SceneAct.tap`), which is
 * only true until it sinks — after that the rng has the column — so all three
 * land on the first surfacing.
 *
 * Lane 8 makes this film the real one (`docs/queue.md`, *THE BLISTER, lane 8*):
 * the bulge on the pilot's screen is lane 2's to draw, and this page names it
 * before anything shows it.
 */
export const THE_BLISTER: GuideScene = {
  ticks: 420,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 3, kind: "blister", color: null, row: 6, by: 2, count: 3 }],
  acts: [
    { tick: 190, tap: true, col: 3 },
    { tick: 205, tap: true, col: 3 },
    { tick: 220, tap: true, col: 3 },
  ],
  steps: [
    { tick: 0, seat: 1, text: "SAY WHERE IT COMES UP", anchor: { at: "body" } },
    { tick: 180, seat: 2, text: "TAP IT OUT WHILE IT IS UP", anchor: { at: "body" } },
  ],
};

import type { GuideScene } from "../scene-types.js";

/**
 * THE BLISTER's rehearsal: the talking it is for, in three pages
 * (`docs/spec/blister.md`, *In one sentence*). One blister, the navigator's
 * to knock down in three taps, and the pilot the seat that sees the pore
 * swell before it comes up.
 *
 * 1. The pilot's screen, the pore swelling on beat 2: *say where*.
 * 2. The navigator's, waiting to see it — two taps land, late, and it sinks
 *    with one left. A hand that waits to see it is the mistake, so the film
 *    makes it rather than a shared page saying it.
 * 3. The pilot's again: it is under, three rows nearer, and swells in a
 *    column the rng picks. Called early, the navigator's thumb is on it a
 *    beat after it surfaces, and the pilot sees it go while it is up. Not
 *    sooner: the caption rides the body and goes with it (`docs/queue.md`).
 *
 * No fourth page shows that tap on the navigator's screen: a page is at
 * least a second and a half (`scene-pages.test.ts`), and the pilot's swell,
 * the surfacing and the tap all fall inside one.
 *
 * The taps name the body by its column (`SceneAct.tap`). The second pore is
 * the rng's, so the seed is the one whose second pore a film can name:
 * authored column 1, two to the left of the first (`mapCol`'s seven).
 */
export const THE_BLISTER: GuideScene = {
  ticks: 560,
  bpm: 120,
  seed: 3,
  entries: [{ beat: 0, col: 3, kind: "blister", color: null, row: 6, by: 2, count: 3 }],
  acts: [
    { tick: 250, tap: true, col: 3 },
    { tick: 280, tap: true, col: 3 },
    { tick: 480, tap: true, col: 1 },
  ],
  steps: [
    { tick: 0, seat: 1, text: "IT SWELLS HERE: SAY WHERE", anchor: { at: "body" } },
    { tick: 180, seat: 2, text: "TOO SLOW: IT SINKS AGAIN", anchor: { at: "body" } },
    { tick: 360, seat: 1, text: "NEARER NOW: CALL IT EARLY", anchor: { at: "body" } },
  ],
};

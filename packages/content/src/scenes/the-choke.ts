import type { GuideScene } from "../scene-types.js";

/**
 * THE CHOKE's rehearsal: nobody steers, and the shot is a beat rather than a
 * place.
 *
 * The fault holds the cannon strip for the whole wave and walks the cannon a
 * column a beat, wall to wall (`sim/choke.ts`) — so `faults` is authored on
 * the film the way it is on the wave, THE JAM's reason: a film with a cannon
 * that behaves would show the one thing this wave is not.
 *
 * **The split is the light.** Both screens show the cannon walking; only the
 * pilot's draws the light along the hull toward the column it steps to next
 * (`render/choke-hull.ts`). So the film is three pages on alternating phones:
 * the navigator watching a cannon neither of them moves, the pilot shown
 * where it goes — across the right wall's turn, the moment the guide asks him
 * to call — and the navigator firing on the beat it comes back under the body.
 *
 * The body stands on column 5, which the cannon crosses going out on beat 4
 * with nobody ready and again on the way back on beat 8, after the turn. The
 * press is timed on the game's half-beat shot grid (`chargeBeats`): the bolt
 * leaves half a beat after the cannon arrives and before it steps on, and a
 * press half a beat later leaves from the next column and misses —
 * `test/scene-choke.test.ts` holds it.
 */
export const THE_CHOKE: GuideScene = {
  ticks: 780,
  bpm: 120,
  chargeBeats: 0.5,
  seed: 1,
  faults: [{ kind: "steer" }],
  entries: [{ beat: 0, col: 5, color: "red" }],
  acts: [{ tick: 480, control: "fireRed" }],
  steps: [
    {
      tick: 0,
      seat: 2,
      text: "THE CANNON WALKS BY ITSELF",
      anchor: { at: "ship", control: "cannon" },
    },
    {
      tick: 210,
      seat: 1,
      text: "ONLY PLAYER 1 SEES THE LIGHT",
      anchor: { at: "ship", control: "cannon" },
    },
    {
      tick: 390,
      seat: 2,
      text: "PLAYER 2 FIRES ON THE CALL",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};

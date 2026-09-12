import type { GuideScene } from "../scene-types.js";

/**
 * THE BEATBOX's rehearsal: the tap you do not make is the one that counts.
 *
 * A box swells on every beat and asks for a number of them. Nothing either
 * seat can fire touches it; it is answered by tapping the body itself, once a
 * beat, on the beat — and the run is finished by **stopping**, because the
 * first beat that goes by untapped is the beat it is judged on
 * (`sim/beatbox-round.ts`).
 *
 * That is why the number is the whole of the pilot's page and the thumb is the
 * whole of the navigator's. The number is drawn over the box on the pilot's
 * screen and on nobody else's, and the thumb is the navigator's alone — so
 * this creature is one sentence said across the room and then two beats of
 * silence, and neither seat can do the other's half.
 *
 * The film asks for three, one more than the wave itself opens with. Three taps
 * and then a stop is the smallest run that can show *the stop is
 * the answer*: a longer run is the same page with more counting in it, and the
 * page after the taps is the one that matters — nothing happens, and the box
 * goes quiet because nothing happened.
 */
export const THE_BEATBOX: GuideScene = {
  ticks: 1440,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 3, kind: "beatbox", color: null, beats: 3 }],
  acts: [
    { tick: 1020, tap: true, col: 3 },
    { tick: 1080, tap: true, col: 3 },
    { tick: 1140, tap: true, col: 3 },
  ],
  steps: [
    // Twelve and a half beats: the box comes down slowly and holds on row
    // six, in the middle of the screen, with the number over it.
    { tick: 0, seat: 1, text: "THE NUMBER IS YOURS ALONE", anchor: { at: "body" } },
    { tick: 750, seat: 2, text: "PLAYER 2 SEES NO NUMBER", anchor: { at: "body" } },
    { tick: 930, seat: 2, text: "TAP IT · ONCE A BEAT", anchor: { at: "body" } },
    { tick: 1170, seat: 2, text: "STOPPING IS THE ANSWER", anchor: { at: "body" } },
  ],
};

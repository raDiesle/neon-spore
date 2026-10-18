import type { GuideScene } from "../scene-types.js";

/**
 * HOLD TOGETHER's rehearsal: a BOTH blister held by one thumb does nothing,
 * held by two at once it gives. THE WEIGHT's film, on the body that took its
 * place on 18 October 2026 — two hands held together is a setting on THE
 * BLISTER now (`BlisterBy`, `"both"`; `sim/blister-hold.ts`).
 *
 * The lesson is still a **negative**: the first two pages are the same page
 * twice, once per seat — a thumb on it alone, the beat running out, nothing
 * given. The third is both thumbs on one beat, and the last the page every film
 * may spend: a second one left alone, breaking the hull when its time is up.
 *
 * Each blister surfaces about three beats after it arrives. The first stays up
 * eight, so it can be held alone at 3⅓ and 6⅓ beats and together at 9⅓ and
 * still go inside its time; the second keeps the default six and runs out
 * before the film ends. It arrives only once the first has gone, because a
 * caption at `body` finds the newest body on the field.
 */
export const HOLD_TOGETHER: GuideScene = {
  ticks: 1320,
  bpm: 120,
  seed: 1,
  entries: [
    {
      beat: 0,
      col: 3,
      kind: "blister",
      color: null,
      row: 6,
      by: "both",
      gesture: "hold",
      upBeats: 8,
    },
    { beat: 11, col: 1, kind: "blister", color: null, row: 6, by: "both", gesture: "hold" },
  ],
  acts: [
    { tick: 200, blister: 1, col: 3 },
    { tick: 380, blister: 2, col: 3 },
    // Both on one tick: the hold counts only while both hands are on.
    { tick: 560, blister: 1, col: 3 },
    { tick: 560, blister: 2, col: 3 },
  ],
  steps: [
    { tick: 0, seat: 1, text: "PLAYER 1 HOLDS IT ALONE", anchor: { at: "body" } },
    { tick: 290, seat: 2, text: "PLAYER 2 HOLDS IT ALONE", anchor: { at: "body" } },
    { tick: 470, seat: 1, text: "BOTH ON ONE BEAT · IT GOES", anchor: { at: "body" } },
    { tick: 700, seat: 1, text: "LEFT ALONE, IT ENDS THE WAVE", anchor: { at: "hit" } },
  ],
};

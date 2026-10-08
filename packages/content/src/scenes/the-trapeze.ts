import type { GuideScene } from "../scene-types.js";

/**
 * THE TRAPEZE's rehearsal: the swing pushed up to its gong, player 1 on the
 * left and player 2 on the right, each as it comes back toward the middle
 * (the owner, 7 October 2026: *add a guide tutorial for the wave that briefly
 * explains the principle*).
 *
 * One `push` level, its gong on the right at twelve degrees. The swing sways
 * in for two beats and the level lights at tick 119, the swing at its left
 * end; it comes back over the left zone for the first half beat of every
 * other half swing (120 ticks, a whole swing being 240 at the film's tempo),
 * and over the right one from 240 on (`trapezeOpenZone`). Player 1 swipes on
 * the left at 130 and 370, player 2 on the right at 490, player 1 again at
 * 610; each lift is toward the middle while the swing comes back, so each is
 * a push. At 719 the swing turns at the right end high enough, and the alien
 * kicks the gong — the level's only one, so the swing goes over the top and
 * away, and the film ends while it does.
 *
 * **What the words carry** is what the field's own `SWIPE` does not: whose
 * side is whose, *when* — the swing coming back, not going out — and what the
 * pushing is for. Not shown: a push too early braking it, a call level, the
 * shots. The fight says each of those when it comes.
 */
export const THE_TRAPEZE: GuideScene = {
  ticks: 960,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: {
    kind: "trapeze",
    steps: [{ ask: "push", gongSide: 1, gongMilli: 12000, beats: 40 }],
  },
  acts: [
    { tick: 130, drag: "trapezePushLeft", until: 136 },
    { tick: 370, drag: "trapezePushLeft", until: 376 },
    { tick: 490, drag: "trapezePushRight", until: 496 },
    { tick: 610, drag: "trapezePushLeft", until: 616 },
  ],
  steps: [
    { tick: 0, seat: 1, text: "PLAYER 1 PUSHES ON THE LEFT", anchor: { at: "boss" } },
    { tick: 220, seat: 1, text: "WHEN IT SWINGS BACK IN", anchor: { at: "boss" } },
    { tick: 400, seat: 2, text: "PLAYER 2 PUSHES ON THE RIGHT", anchor: { at: "boss" } },
    { tick: 600, seat: 2, text: "ONCE HIGH, IT KICKS THE GONG", anchor: { at: "boss" } },
  ],
};

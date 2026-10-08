import type { GuideScene } from "../scene-types.js";

/**
 * THE LATCH's rehearsal: the tendril hauled down hand over hand, one grip
 * holding while the other pulls, and then both held through a yank.
 *
 * Two levels: a `haul` of one knot, then a `yank`. The slime drops in for
 * four beats, sixty ticks each at the film's tempo, and the haul lights at
 * tick 239. Player 2's thumb is on the right grip from tick 90 and only
 * holds: the left grip pulls first. Player 1 pulls the left a whole reach
 * down and lets go at 380, and the turn passes to the right; player 1 takes
 * hold again at 400, so player 2 can lift at 470 and pull from where the tendril now
 * is, and the second reach passes the knot — one body of the slime torn off,
 * the haul won. The yank lights after its rest, both thumbs go down at 810,
 * and the slime rears and yanks against two hands, and nothing slips.
 *
 * **What the words carry** is what the field's own `PULL` and `HOLD` do not:
 * whose grip is whose, that the two take turns — one pulls while the other
 * holds — and that a yank wants both. Not shown: a slip from both letting
 * go, and the crossed grips of the last level. The fight says each of those
 * when it comes.
 */
export const THE_LATCH: GuideScene = {
  ticks: 1200,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: {
    kind: "latch",
    steps: [
      { ask: "haul", knots: 1, beats: 40 },
      { ask: "yank", knots: 2, beats: 40 },
    ],
  },
  acts: [
    { tick: 90, drag: "latchGripRight", toMilli: 0, until: 470 },
    { tick: 300, drag: "latchGripLeft", by: 360, until: 380 },
    { tick: 400, drag: "latchGripLeft", toMilli: 0, until: 660 },
    { tick: 480, drag: "latchGripRight", by: 540, until: 570 },
    { tick: 810, drag: "latchGripLeft", toMilli: 0, until: 1180 },
    { tick: 810, drag: "latchGripRight", toMilli: 0, until: 1180 },
  ],
  steps: [
    { tick: 0, seat: 2, text: "PLAYER 2 HOLDS ON", anchor: { at: "boss" } },
    { tick: 210, seat: 1, text: "PLAYER 1 PULLS, LETS GO", anchor: { at: "boss" } },
    { tick: 390, seat: 2, text: "THEN PLAYER 2 PULLS", anchor: { at: "boss" } },
    { tick: 720, seat: 1, text: "IT REARS: BOTH HOLD ON", anchor: { at: "boss" } },
  ],
};

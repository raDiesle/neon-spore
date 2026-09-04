import type { GuideScene } from "../scene-types.js";

/**
 * THE HAND's rehearsal: the one verb neither seat owns.
 *
 * Everything else in this game is split — a control belongs to a screen, and
 * half of every job is on the other phone. THE GRIP is not: a finger held on
 * something falling drags at it, either player may do it to anything, and the
 * price is only that a thumb on the field is a thumb off the strip below it
 * (`sim/grip.ts`, docs/spec/assists.md). The wave is three rocks on one beat
 * against one shield, and the arithmetic simply does not work without a hand.
 *
 * The film runs two rather than three, because two is the smallest number that
 * makes the problem: one shield, two columns, one beat. Player 1 holds the far
 * one back, player 2 takes the near one, and then the shield walks across to
 * the one that was held. One impossible beat turned into two possible ones,
 * which is the whole of what the assist is for.
 *
 * **The hand is on the field and is drawn from the world.** A grip act names a
 * column and a span of ticks; which body that is comes from the runner at the
 * moment the hand goes down (`sim/scene.ts`), and where the hand is drawn comes
 * from where that body is being drawn (`render/guide-thumb.ts`). So the thumb
 * rides the rock it is slowing, and cannot be somewhere the rock is not.
 */
export const THE_HAND: GuideScene = {
  ticks: 1500,
  bpm: 120,
  seed: 1,
  entries: [
    { beat: 0, col: 1, kind: "meteor", color: null },
    { beat: 0, col: 5, kind: "meteor", color: null },
  ],
  acts: [
    // Half a beat after its page opens rather than the beat and a half every
    // other press in these films waits — and the exception is the anchor's.
    // The page points at *what is being held*, so until the hand is down there
    // is no subject and no caption; thirty ticks is the caption's own fade and
    // no more. It is also the one press where arriving with the words spoils
    // nothing: the hand is the sentence rather than the answer to it.
    { tick: 350, grip: 1, col: 5, until: 1080 },
    { tick: 690, control: "shield", col: 3 },
    { tick: 750, control: "shield", col: 2 },
    { tick: 810, control: "shield", col: 1 },
    { tick: 850, control: "guard" },
    { tick: 1050, control: "shield", col: 3 },
    { tick: 1110, control: "shield", col: 5 },
    { tick: 1270, control: "guard" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "TWO AT ONCE · ONE SHIELD", anchor: { at: "body" } },
    { tick: 320, seat: 1, text: "PLAYER 1 HOLDS ONE BACK", anchor: { at: "held" } },
    {
      tick: 600,
      seat: 2,
      text: "PLAYER 2 TAKES THE FIRST",
      anchor: { at: "control", control: "shield" },
    },
    {
      tick: 960,
      seat: 2,
      text: "THEN THE ONE HE HELD",
      anchor: { at: "control", control: "shield" },
    },
  ],
};

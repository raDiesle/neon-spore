import type { GuideScene } from "../scene-types.js";

/**
 * THE HASP's rehearsal: a wheel that turns only while the other player holds.
 *
 * The row hangs sealed for `haspStillBeats`, then the first latch lights
 * (`sim/hasp-step.ts`). The pilot carries it down past `haspGripMilli` and
 * keeps it there; the navigator's hand goes on the wheel's rim and turns. Then
 * the pilot lets go with the wheel not yet wound, and **she keeps turning** —
 * her thumb goes on round and the knurl stays where it seized, a beat later,
 * which is the one thing the pair has to say out loud (`render/guide-boss-hand.ts`
 * draws her hand where she is, not where the wheel is). He takes the latch
 * again, the wheel frees on the next beat, and the rest of the wind opens
 * the first hasp.
 *
 * The heat is not on a page: one grip here is five beats and a burn is
 * twelve (`haspHoldBeats`), so the latch never runs out, and the burn is his
 * own colour on his own screen for the pair to meet in the wave. Every act's
 * distance is the handle's own — the whole reach for the latch, and a wheel
 * turned at `haspTurnPerTickMilli` until the hand lifts (`scene-turn.ts`) —
 * and `test/scene-hasp.test.ts` holds the seize and the opening to their beats.
 */
export const THE_HASP: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "hasp" },
  acts: [
    { tick: 150, drag: "haspLatch", by: 210, until: 480 },
    { tick: 300, drag: "haspWheel", until: 960 },
    { tick: 690, drag: "haspLatch", by: 750, until: 960 },
  ],
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "HOLD THE LATCH DOWN",
      anchor: { at: "handle", target: "haspLatch" },
    },
    {
      tick: 210,
      seat: 2,
      text: "TURN WHILE PLAYER 1 HOLDS",
      anchor: { at: "handle", target: "haspWheel" },
    },
    {
      tick: 390,
      seat: 2,
      text: "LET GO AND IT SEIZES",
      anchor: { at: "handle", target: "haspWheel" },
    },
    {
      tick: 600,
      seat: 1,
      text: "TAKE IT AGAIN · SAY SO",
      anchor: { at: "handle", target: "haspLatch" },
    },
    { tick: 840, seat: 2, text: "WOUND FAR ENOUGH · IT OPENS", anchor: { at: "boss" } },
  ],
};

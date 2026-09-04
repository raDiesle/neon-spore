import { PINBALL_ROUNDS } from "../pinball-rounds.js";
import type { GuideScene } from "../scene-types.js";

/**
 * PINBALL's rehearsal: the thing you fire from is the thing you have to catch
 * it with.
 *
 * The ship folds into a bucket. One ball goes up out of it, comes down through
 * the table, and the same bucket has to be under it when it lands. Player 1
 * holds the bucket *and* stops the sweeping needle; player 2 does one thing and
 * cannot do it until the needle has stopped. That is why the film is lopsided —
 * three of its five pages are his — and it is the wave being lopsided rather
 * than the film.
 *
 * **It ends on a miss, and that is the only page that could have ended it.**
 * The whole of the round is the sentence *and then get back under wherever the
 * ball is coming down*, which is a thing a pair fails at before they do it: the
 * bucket is left where the shot was aimed from, the ball comes down somewhere
 * else, and the hull pays. Showing the catch would have taught the arithmetic
 * of one particular board; showing the drop teaches what the bucket is for.
 *
 * The film's one page about what both screens share is spent on it.
 */
export const PINBALL: GuideScene = {
  ticks: 1320,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "pinball", rounds: PINBALL_ROUNDS },
  acts: [
    // Every one of these waits for the body to finish folding into a bucket:
    // the round is in its `morph` phase for six beats and a press inside it is
    // a press nobody meant. The slide is a *hold* — the bucket travels for as
    // long as the thumb is on the slab (`ControlPress.up`).
    { tick: 450, control: "pinRight", until: 560 },
    { tick: 710, control: "pinLatch" },
    // Long after the needle stopped, because the bar the launch takes its
    // strength off does not stop: it fills and empties on its own, and the
    // press is a moment inside that rather than the next thing on a list.
    { tick: 1010, control: "pinLaunch" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "PLAYER 1 HOLDS THE BUCKET", anchor: { at: "hull" } },
    {
      tick: 360,
      seat: 1,
      text: "SLIDE TO WHERE IT STARTS",
      anchor: { at: "control", control: "pinRight" },
    },
    {
      tick: 620,
      seat: 1,
      text: "SET STOPS THE NEEDLE",
      anchor: { at: "control", control: "pinLatch" },
    },
    {
      tick: 860,
      seat: 2,
      text: "PLAYER 2 TAKES THE POWER",
      anchor: { at: "control", control: "pinLaunch" },
    },
    { tick: 1100, seat: 1, text: "MISS IT AND THE HULL PAYS", anchor: { at: "health" } },
  ],
};

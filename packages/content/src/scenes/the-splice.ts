import type { GuideScene } from "../scene-types.js";

/**
 * THE SPLICE's rehearsal: the number is at the other end of the straw, and only
 * one of you can see it.
 *
 * Straws run the whole height of the field, tangled across one another. Their
 * bottom ends are mouths the cannon can stand under; their top ends carry the
 * numbers that say the order. The navigator is shown the tangle and has no
 * SUCK; the pilot is shown a hand's width of straw over each mouth and holds
 * both the cannon and the maw. So a feed is a sentence — *the second from the
 * left* — and neither seat can say the whole of it.
 *
 * The film is that sentence, once. Two pages of the same instant on the two
 * phones, which is the shape every film about a split ends up with; then the
 * slide, then the suck, then the number coming down its own straw while both
 * of them watch it.
 *
 * **One feed and not two.** The second is the first again, and the two beats a
 * number spends travelling are the whole of what the page after the suck is
 * for: a pair that presses again while one is in the air has not understood
 * that the answer is still coming (`sim/splice-round.ts`).
 *
 * **Authored column 4 is a measurement.** A two-straw round stands its mouths
 * in columns 3 and 7, the permutation is never the identity, so the mouth
 * holding number one is always the right-hand one — and 4 is what an author
 * can write that reaches column 7 on the eleven the game is played on. The
 * film feeds the right one or it damages the hull, which is `scenes.test.ts`'s
 * own invariant rather than an expectation anybody had to write down.
 */
export const THE_SPLICE: GuideScene = {
  ticks: 1440,
  bpm: 120,
  seed: 1,
  entries: [],
  // Its own rounds, longer than the wave's: a clock that ran out inside the
  // loop would cost the hull and make the rehearsal a picture of losing.
  boss: { kind: "splice", rounds: [{ beats: 28 }, { beats: 36 }] },
  acts: [
    { tick: 840, control: "cannon", col: 4 },
    { tick: 1200, control: "mawTake" },
  ],
  steps: [
    { tick: 0, seat: 2, text: "YOU READ THE TANGLE", anchor: { at: "hull" } },
    { tick: 360, seat: 1, text: "YOU SEE ONLY THE MOUTHS", anchor: { at: "hull" } },
    {
      tick: 720,
      seat: 1,
      text: "SLIDE UNDER THE ONE CALLED",
      anchor: { at: "control", control: "cannon" },
    },
    // The suck is at 1200 and the number lands two beats later, inside this
    // page: the press and the answer are apart on purpose and the page has to
    // hold both or it teaches a control that does nothing.
    {
      tick: 1080,
      seat: 2,
      text: "SUCK. ONE COMES DOWN",
      anchor: { at: "control", control: "mawTake" },
    },
  ],
};

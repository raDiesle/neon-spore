import type { GuideScene } from "../scene-types.js";

/**
 * THE GAUGE's rehearsal: neither of them has more than half a dial.
 *
 * The field is gone. One cannon and one wound in the alien over it, and the
 * pair between them holds one gun: player 1 has the valve and cannot see where
 * the cannon has to point, player 2 can see exactly where and cannot turn anything. Five calls
 * landed between the marks and the field comes back.
 *
 * Three pages since the field learned to say her verb. The first two are the
 * same dial on the two phones, which is the whole of it — the marks are on hers
 * and not on his — and the last is what a call costs. He keeps a page of his
 * own because the field can tell him nothing true: the only word it could put
 * over his valve is a direction, and the direction is hers to say.
 *
 * **The needle is parked and the marks come to it**, which is the round's own
 * behaviour and the reason the last page is a wait rather than a press. The
 * band walks along the dial every beat, so a call is a moment rather than a
 * position: *say where it has to go, then call it — and the marks move*. The
 * film turns the valve until the needle is a little ahead of the band, lets go,
 * and calls when the band arrives. One `marks` becomes one, and the band jumps
 * somewhere else entirely, which is the simulation saying the same thing.
 */
export const THE_GAUGE: GuideScene = {
  ticks: 900,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "gauge" },
  acts: [
    // A hold rather than a press: the needle travels for as long as the thumb
    // is on the lobe, and `until` is the tick it lifts (`ControlPress.up`).
    { tick: 450, control: "gaugeRight", until: 550 },
    { tick: 680, control: "gaugeCall" },
  ],
  steps: [
    // On the dial (`render/caption-anchor-boss-f.ts`, 21 September 2026). It
    // was on the hull, which this round does not have: the field is gone, and
    // the anchor was pointing at the middle of a plating nothing draws.
    { tick: 0, seat: 2, text: "ONE CANNON, ONE WOUND", anchor: { at: "boss" } },
    // Two pages until 18 September 2026: this one on the hull and PLAYER 1
    // TURNS THE VALVE on the valve itself. They are one page now, said on the
    // thumb that does it — the split is what he needs and the verb is what the
    // lobe under the words already is.
    {
      tick: 180,
      seat: 1,
      text: "PLAYER 1 CANNOT SEE IT",
      anchor: { at: "control", control: "gaugeRight" },
    },
    // PLAYER 2 CALLS IT stood here, and the field writes `PRESS` / `CALL` on
    // the end of the needle the moment it stands between the marks, on her
    // screen and not on his (`decisions.md` #34,
    // `render/boss-cue-read-w.ts`). What no cue may say is what a call *does*:
    // a mark spends the band it was made on, the next one is somewhere else,
    // and the pair has to find it again from words alone. That is the round,
    // and this is now the page that says it.
    {
      tick: 590,
      seat: 2,
      text: "EACH HIT MOVES THE WOUND",
      anchor: { at: "control", control: "gaugeCall" },
    },
  ],
};

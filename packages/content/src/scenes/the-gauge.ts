import type { GuideScene } from "../scene-types.js";

/**
 * THE GAUGE's rehearsal: neither of them has more than half a dial.
 *
 * The field is gone. One needle and two marks, and the pair between them holds
 * one instrument: player 1 has the valve and cannot see where the needle has to
 * go, player 2 can see exactly where and cannot turn anything. Five calls
 * landed between the marks and the field comes back.
 *
 * The first two pages are the same dial on the two phones, which is the whole
 * of it — the marks are on hers and not on his — and then the two halves of one
 * call: he turns it where she says and stops, she waits and calls it.
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
    // is on the slab, and `until` is the tick it lifts (`ControlPress.up`).
    { tick: 450, control: "gaugeRight", until: 550 },
    { tick: 680, control: "gaugeCall" },
  ],
  steps: [
    { tick: 0, seat: 2, text: "ONE NEEDLE, TWO MARKS", anchor: { at: "hull" } },
    { tick: 180, seat: 1, text: "PLAYER 1 CANNOT SEE THEM", anchor: { at: "hull" } },
    {
      tick: 360,
      seat: 1,
      text: "PLAYER 1 TURNS THE VALVE",
      anchor: { at: "control", control: "gaugeRight" },
    },
    {
      tick: 590,
      seat: 2,
      text: "PLAYER 2 CALLS IT",
      anchor: { at: "control", control: "gaugeCall" },
    },
  ],
};

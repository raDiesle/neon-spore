import type { GuideScene } from "../scene-types.js";

/**
 * THE CROSSING's rehearsal: the lane you are aiming up is only yours until
 * something walks across it.
 *
 * A rock that comes over a side wall holds one row and crosses two lanes a
 * beat. It never reaches the ship and nothing turns it away — what it does is
 * stand in front of the cannon on its way past, and a bolt that meets one dies
 * there while the body above it goes on falling.
 *
 * The split is the warning strip, which is why both of the opening pages point
 * at it rather than at the field. The pilot's strip carries the arrow — the
 * row, the side and the way it will fly — before there is anything to see; the
 * navigator's carries nothing at all until the rock is already on the field.
 * The same anchor on the two screens, pointing at a thing and at its absence,
 * is the whole reason `radar` exists as an anchor.
 *
 * Then the field: the rock crossing the column the cannon is standing in,
 * with no hand anywhere, because waiting is the answer and a page about
 * waiting cannot show a thumb. The shot is the page after it, once the lane is
 * empty again.
 */
export const THE_CROSSING: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 1,
  entries: [
    { beat: 0, col: 0, kind: "meteor", color: null, cross: 1, row: 5 },
    { beat: 6, col: 3, color: "red" },
    // Row six, so the page about it holds with the rock in the middle of the
    // screen and still the highest body there — the slick is a row under it
    // by then — which is the body the caption rings.
    { beat: 8, col: 6, kind: "meteor", color: null, cross: -1, row: 6 },
  ],
  acts: [
    { tick: 390, control: "cannon", col: 3 },
    { tick: 930, control: "fireRed" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "AN ARROW AT THE EDGE", anchor: { at: "radar" } },
    { tick: 240, seat: 2, text: "PLAYER 2 SEES NO ARROW", anchor: { at: "radar" } },
    { tick: 480, seat: 1, text: "THE ROCK CROSSES YOUR LANE", anchor: { at: "body" } },
    {
      tick: 840,
      seat: 2,
      text: "FIRE WHEN THE LANE IS CLEAR",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
